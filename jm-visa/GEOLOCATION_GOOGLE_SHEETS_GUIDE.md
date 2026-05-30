# 🌍 Geolocation in Forms + Google Sheets Integration Guide

> **Purpose:** This guide explains exactly how to implement automatic geolocation capture (city, region, country, pincode, IP) in every form on a website, and send that data alongside form submissions to both email notifications and Google Sheets. This was already implemented on the **Eazy Visa** website and should be replicated on the target website.

---

## 📋 Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Step 1: Create the Geolocation Hook](#2-step-1-create-the-geolocation-hook)
3. [Step 2: Create the Google Sheets Client Library](#3-step-2-create-the-google-sheets-client-library)
4. [Step 3: Set Up Google Apps Script (Google Sheets Webhook)](#4-step-3-set-up-google-apps-script-google-sheets-webhook)
5. [Step 4: Integrate the Hook into Form Components](#5-step-4-integrate-the-hook-into-form-components)
6. [Step 5: Update API Routes to Accept & Forward Geo Data](#6-step-5-update-api-routes-to-accept--forward-geo-data)
7. [Step 6: Add Geo Data to Email Notifications](#7-step-6-add-geo-data-to-email-notifications)
8. [Step 7: Send Geo Data to Google Sheets](#8-step-7-send-geo-data-to-google-sheets)
9. [Step 8: Environment Variables](#9-step-8-environment-variables)
10. [Checklist & Testing](#10-checklist--testing)
11. [Full Reference Code Snippets](#11-full-reference-code-snippets)

---

## 1. Overview & Architecture

### How It Works (Data Flow)

```
┌─────────────────────┐
│   User visits page  │
│   (any form page)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  useGeoLocation hook runs on mount      │
│  Calls: https://ipapi.co/json/          │
│  Gets: city, region, country, postal, ip│
└─────────┬───────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  User fills out & submits form          │
│  Geo data is attached to submission     │
│  Fields: userLocation, userPincode,     │
│          userIp                         │
└─────────┬───────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  API Route receives POST request        │
│  1. Sends email via Nodemailer          │
│     (includes geo data section)         │
│  2. Sends data to Google Sheets         │
│     via Apps Script webhook             │
└─────────────────────────────────────────┘
```

### Files You Will Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useGeoLocation.js` | **CREATE** | React hook to auto-fetch user location on page load |
| `src/lib/googleSheetsClient.js` | **CREATE** | Reusable client to POST data to Google Sheets webhook |
| `Google Apps Script` | **CREATE** (in Google Sheets) | Receives webhook POSTs and appends rows to the sheet |
| Every form component | **MODIFY** | Import hook, attach geo data to submission payload |
| Every API route that handles form submissions | **MODIFY** | Accept geo fields, include in email & Google Sheets payload |
| `.env.local` | **MODIFY** | Add Google Sheets webhook URL |

---

## 2. Step 1: Create the Geolocation Hook

### Create file: `src/hooks/useGeoLocation.js`

This is a **client-side React hook** that fires once when the component mounts. It calls the free [ipapi.co](https://ipapi.co/) API to get the user's IP-based location. No API key is required for small volumes (up to ~1,000 requests/day free).

```javascript
import { useState, useEffect } from 'react';

const useGeoLocation = () => {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const fetchGeo = async () => {
            try {
                // ipapi.co provides HTTPS and doesn't require a key for small volumes
                const response = await fetch('https://ipapi.co/json/');
                if (!response.ok) return;
                const data = await response.json();
                setLocation({
                    city: data.city,
                    region: data.region,
                    pincode: data.postal,
                    country: data.country_name,
                    ip: data.ip
                });
            } catch (err) {
                console.error("Geo fetch failed:", err);
            }
        };
        fetchGeo();
    }, []);

    return location;
};

export default useGeoLocation;
```

### Key Details:
- **Returns `null`** initially (while fetching), then an object with `{ city, region, pincode, country, ip }`.
- **Gracefully degrades** — if the API call fails, `location` stays `null` and forms still submit with `'Unknown'` as fallback.
- **Only calls once** per component mount (empty dependency array `[]`).
- The component using this hook **must be a client component** (`"use client"` directive).

### Alternative APIs (if ipapi.co has rate limits):
| API | URL | Free Tier |
|-----|-----|-----------|
| ipapi.co | `https://ipapi.co/json/` | ~1,000/day |
| ip-api.com | `http://ip-api.com/json/` | 45/minute (HTTP only) |
| ipinfo.io | `https://ipinfo.io/json?token=YOUR_TOKEN` | 50,000/month with free token |
| Abstract API | `https://ipgeolocation.abstractapi.com/v1/?api_key=KEY` | 20,000/month |

---

## 3. Step 2: Create the Google Sheets Client Library

### Create file: `src/lib/googleSheetsClient.js`

This is a **server-side utility** (used inside API routes, NOT on the client) that POSTs JSON data to a Google Apps Script web app URL.

```javascript
const GOOGLE_SHEETS_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
  'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

const jsonHeaders = { 'Content-Type': 'application/json' };

const logPrefix = (context) => (context ? `[Google Sheets] ${context}` : '[Google Sheets]');

export const sendToGoogleSheets = async (payload, context = '') => {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    console.warn(`${logPrefix(context)} Missing webhook URL.`);
    return;
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${logPrefix(context)} Request failed`, response.status, errorText);
    }

    return response;
  } catch (error) {
    console.error(`${logPrefix(context)} Request error`, error);
  }
};

export { GOOGLE_SHEETS_WEBHOOK_URL };
```

### Key Details:
- The `context` parameter is for logging (e.g., `'visa form'`, `'contact form'`).
- The webhook URL is stored in an environment variable.
- Errors are logged but **do not throw** — form submission continues even if Google Sheets fails.

---

## 4. Step 3: Set Up Google Apps Script (Google Sheets Webhook)

This is the **receiving end** that lives inside Google Sheets, accepting POST requests and writing rows.

### 4.1 Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. Name the first sheet (tab) — e.g., `Form Submissions`.
3. Add headers in **Row 1**. The columns should match what your API sends. Example headers:

```
| A         | B        | C     | D     | E          | F       | G           | H            | I            | J        | K          | L            | M         |
|-----------|----------|-------|-------|------------|---------|-------------|--------------|--------------|----------|------------|--------------|-----------|
| Timestamp | Name     | Email | Phone | Country    | Service | Form Source | User Location| User Pincode | User IP  | Page Link  | Submitted At | Extra Info|
```

### 4.2 Create the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**.
2. Replace the default code with:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Append a row with the data
    // Adjust these fields to match what your API sends
    sheet.appendRow([
      new Date(),                           // Timestamp (auto-generated)
      data.name || (data.firstName + ' ' + data.lastName) || '',  // Name
      data.email || '',                     // Email
      data.phone || data.googleSheetsPhone || '',  // Phone
      data.country || data.countryName || '',      // Country
      data.visaType || data.serviceSelected || '', // Service
      data.formSource || data.source || data.from || '',  // Form Source
      data.userLocation || '',              // User Location (city, region, country)
      data.userPincode || '',               // User Pincode
      data.userIp || '',                    // User IP Address
      data.pageLink || '',                  // Page Link
      data.submittedAt || '',               // Submitted At (IST)
      data.extraInfo || '',                 // Extra Info
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight requests
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'Webhook is active' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 4.3 Deploy as Web App

1. Click **Deploy → New deployment**.
2. Select **Web app** as the type.
3. Set:
   - **Description:** Form Submissions Webhook
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
4. Click **Deploy**.
5. **Copy the Web App URL** — this is your webhook URL. It looks like:
   ```
   https://script.google.com/macros/s/AKfycbw.../exec
   ```
6. Save this URL in your `.env.local` file (see Step 8).

### ⚠️ Important Notes:
- Every time you modify the Apps Script code, you need to create a **new deployment** for changes to take effect.
- The "Anyone" access setting means no authentication is needed (suitable for server-to-server calls from your API routes).
- **Customize the `sheet.appendRow([...])` fields** to match the exact columns in your Google Sheet header row.

---

## 5. Step 4: Integrate the Hook into Form Components

For **every form component** on the website, follow this pattern:

### 5.1 Import the hook

```javascript
import useGeoLocation from '../../hooks/useGeoLocation';
// Adjust the import path based on your component's location
```

### 5.2 Call the hook inside the component

```javascript
const MyFormComponent = () => {
  const userGeo = useGeoLocation();
  // ... rest of component
};
```

### 5.3 Attach geo data to the form submission payload

When building the `fetch` body in your `handleSubmit` function, add these three fields:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const response = await fetch('/api/your-form-endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // ... other form fields ...
      
      // --- GEO DATA (add these 3 fields) ---
      userLocation: userGeo 
        ? `${userGeo.city}, ${userGeo.region}, ${userGeo.country}` 
        : 'Unknown',
      userPincode: userGeo ? userGeo.pincode : 'Unknown',
      userIp: userGeo ? userGeo.ip : 'Unknown',
    }),
  });
};
```

### 5.4 Formatting Patterns Used

| Field | Format | Example |
|-------|--------|---------|
| `userLocation` | `"City, Region, Country"` | `"Mumbai, Maharashtra, India"` |
| `userPincode` | Postal code string | `"400001"` |
| `userIp` | IP address string | `"103.21.244.1"` |

### 5.5 List of ALL Form Components to Update

You must identify **every** form component in the target website. In the Eazy Visa project, these were:

1. `ConsultationForm.jsx` — Main visa consultation form
2. `FormComponent.jsx` — Generic reusable form
3. `PopupForm.jsx` — Modal/popup form
4. `CountryCardPopupForm.jsx` — Country-specific popup form
5. `SubscribeForm.jsx` — Blog subscribe form
6. `HotelBookingComponent.jsx` — Hotel booking form
7. `DummyBooking.jsx` — Flight dummy booking form
8. `MostPreferredBooking.jsx` — Most preferred booking form

**→ Scan the target website codebase for ALL form components and apply the same pattern to each one.**

---

## 6. Step 5: Update API Routes to Accept & Forward Geo Data

For **every API route** that handles a form submission:

### 6.1 Destructure the new fields from the request body

```javascript
export const POST = async (req) => {
  try {
    const {
      // ... existing fields ...
      userLocation,
      userPincode,
      userIp,
    } = await req.json();
    
    // ... rest of handler
  } catch (error) {
    // error handling
  }
};
```

### 6.2 List of API Routes to Update

In the Eazy Visa project, these API routes were modified:

| API Route | Handles |
|-----------|---------|
| `/api/submit-form` | Generic form submissions |
| `/api/submit-visa-form` | Visa consultation forms |
| `/api/blog-contact` | Blog contact form |
| `/api/hotel-booking` | Hotel booking form |
| `/api/flight-booking` | Flight booking form |
| `/api/most-preferred-booking` | Most preferred booking form |

**→ Find all equivalent API routes in the target website.**

---

## 7. Step 6: Add Geo Data to Email Notifications

In each API route's email template (using Nodemailer or any email service), add a **User Location Details** section:

### HTML Email Section

```html
<h2 style="color: #2563eb; margin-top: 20px;">User Location Details (Auto-Fetched)</h2>
<p><strong>Location:</strong> ${userLocation || 'Unknown'}</p>
<p><strong>Pincode:</strong> ${userPincode || 'Unknown'}</p>
<p><strong>IP Address:</strong> ${userIp || 'Unknown'}</p>
```

### Plain Text Email Section

```text
User Location Details:
-----------------
Location: ${userLocation || 'Unknown'}
Pincode: ${userPincode || 'Unknown'}
IP Address: ${userIp || 'Unknown'}
```

### Key: Always use `|| 'Unknown'` as fallback in case geo fetch failed on the client side.

---

## 8. Step 7: Send Geo Data to Google Sheets

In each API route, when calling `sendToGoogleSheets()`, include the geo fields in the payload:

```javascript
import { sendToGoogleSheets } from '../../../lib/googleSheetsClient';

// Inside your POST handler, after sending the email:
await sendToGoogleSheets(
  {
    // ... other fields like name, email, phone, etc. ...
    
    // --- GEO DATA ---
    userLocation: userLocation || '',
    userPincode: userPincode || '',
    userIp: userIp || '',
    
    // --- TIMESTAMP ---
    submittedAt: indianTime, // or however you generate timestamps
  },
  'form name for logging' // e.g., 'contact form', 'booking form'
);
```

### Complete API Route Example (minimal)

```javascript
import nodemailer from 'nodemailer';
import { sendToGoogleSheets } from '../../../lib/googleSheetsClient';

export const POST = async (req) => {
  try {
    const { name, email, phone, message, userLocation, userPincode, userIp } = await req.json();

    // 1. Validate required fields
    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: 'Required fields missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Website Form" <${process.env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: process.env.NEXT_PUBLIC_EMAIL_RECEIVER,
      subject: `New Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong> ${message || 'N/A'}</p>
          
          <h3>User Location Details (Auto-Fetched)</h3>
          <p><strong>Location:</strong> ${userLocation || 'Unknown'}</p>
          <p><strong>Pincode:</strong> ${userPincode || 'Unknown'}</p>
          <p><strong>IP Address:</strong> ${userIp || 'Unknown'}</p>
        </div>
      `,
    });

    // 3. Send to Google Sheets
    await sendToGoogleSheets(
      {
        name,
        email,
        phone,
        message: message || '',
        userLocation: userLocation || '',
        userPincode: userPincode || '',
        userIp: userIp || '',
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      },
      'contact form'
    );

    return new Response(
      JSON.stringify({ success: true, message: 'Form submitted successfully!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error submitting form.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

---

## 9. Step 8: Environment Variables

Add these to your `.env.local` file:

```env
# Google Sheets Webhook URL (from Apps Script deployment)
NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Email Configuration (for Nodemailer)
NEXT_PUBLIC_EMAIL_USER=your-email@gmail.com
NEXT_PUBLIC_EMAIL_APP_PASSWORD=your-gmail-app-password
NEXT_PUBLIC_EMAIL_RECEIVER=receiver-email@gmail.com
```

### Gmail App Password Setup:
1. Go to [Google Account Security](https://myaccount.google.com/security).
2. Enable **2-Step Verification** if not already enabled.
3. Go to **App passwords** (search for it in Google Account settings).
4. Generate a new app password for "Mail" → "Other (Custom name)".
5. Use the generated 16-character password as `NEXT_PUBLIC_EMAIL_APP_PASSWORD`.

---

## 10. Checklist & Testing

### ✅ Implementation Checklist

- [ ] **Created** `src/hooks/useGeoLocation.js`
- [ ] **Created** `src/lib/googleSheetsClient.js`
- [ ] **Set up** Google Sheet with correct column headers
- [ ] **Created** Google Apps Script with `doPost` function
- [ ] **Deployed** Apps Script as Web App
- [ ] **Added** webhook URL to `.env.local`
- [ ] **Identified** all form components in the target website
- [ ] **For each form component:**
  - [ ] Added `"use client"` directive (if not already present)
  - [ ] Imported `useGeoLocation` hook
  - [ ] Called `const userGeo = useGeoLocation();` inside the component
  - [ ] Added `userLocation`, `userPincode`, `userIp` to the fetch body
- [ ] **For each API route:**
  - [ ] Destructured `userLocation`, `userPincode`, `userIp` from request body
  - [ ] Added geo data section to email HTML template
  - [ ] Added geo data section to email plain text template
  - [ ] Included `userLocation`, `userPincode`, `userIp` in `sendToGoogleSheets()` payload
- [ ] **Tested** form submission — geo data shows in email
- [ ] **Tested** Google Sheets — new row appears with geo data columns filled

### 🧪 Testing Steps

1. **Test Geo Hook independently:**
   - Add a temporary `console.log(userGeo)` in a form component.
   - Open the page in browser and check the console — you should see the location object after ~1 second.

2. **Test Form Submission:**
   - Fill out and submit each form.
   - Check the email received — it should have the "User Location Details" section.
   - Check Google Sheets — a new row should appear with `userLocation`, `userPincode`, `userIp` columns populated.

3. **Test Fallback (geo blocked):**
   - Block `ipapi.co` in browser DevTools (Network tab → Block request URL).
   - Submit the form — it should still work, with `'Unknown'` in the geo fields.

---

## 11. Full Reference Code Snippets

### Geolocation Hook — `src/hooks/useGeoLocation.js`

```javascript
import { useState, useEffect } from 'react';

const useGeoLocation = () => {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const fetchGeo = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                if (!response.ok) return;
                const data = await response.json();
                setLocation({
                    city: data.city,
                    region: data.region,
                    pincode: data.postal,
                    country: data.country_name,
                    ip: data.ip
                });
            } catch (err) {
                console.error("Geo fetch failed:", err);
            }
        };
        fetchGeo();
    }, []);

    return location;
};

export default useGeoLocation;
```

### Google Sheets Client — `src/lib/googleSheetsClient.js`

```javascript
const GOOGLE_SHEETS_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
  'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

const jsonHeaders = { 'Content-Type': 'application/json' };

const logPrefix = (context) => (context ? `[Google Sheets] ${context}` : '[Google Sheets]');

export const sendToGoogleSheets = async (payload, context = '') => {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    console.warn(`${logPrefix(context)} Missing webhook URL.`);
    return;
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${logPrefix(context)} Request failed`, response.status, errorText);
    }

    return response;
  } catch (error) {
    console.error(`${logPrefix(context)} Request error`, error);
  }
};

export { GOOGLE_SHEETS_WEBHOOK_URL };
```

### Pattern for Form Component Integration

```javascript
"use client";
import useGeoLocation from '../../hooks/useGeoLocation'; // Adjust path

const MyFormComponent = () => {
  const userGeo = useGeoLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/your-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // ... your form fields ...
        userLocation: userGeo ? `${userGeo.city}, ${userGeo.region}, ${userGeo.country}` : 'Unknown',
        userPincode: userGeo ? userGeo.pincode : 'Unknown',
        userIp: userGeo ? userGeo.ip : 'Unknown',
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields here */}
    </form>
  );
};
```

---

## 📝 Summary

| Layer | What To Do |
|-------|-----------|
| **Client Hook** | `useGeoLocation` auto-fetches city/region/country/pincode/IP from `ipapi.co/json/` |
| **Form Components** | Import hook → call `useGeoLocation()` → attach 3 fields to POST body |
| **API Routes** | Destructure 3 geo fields → include in email HTML → include in Google Sheets payload |
| **Google Sheets Client** | Simple `fetch` POST to Apps Script webhook URL |
| **Google Apps Script** | `doPost()` parses JSON → `appendRow()` to sheet |
| **Fallback** | If geo fetch fails, forms still work with `'Unknown'` values |

**Dependencies needed:** `nodemailer` (for email sending)

**No new npm packages needed for geolocation** — it uses the native `fetch` API with a free external service.

---

*This guide was created from the working implementation on the Eazy Visa website (easy-visa project). All code patterns are production-tested.*
