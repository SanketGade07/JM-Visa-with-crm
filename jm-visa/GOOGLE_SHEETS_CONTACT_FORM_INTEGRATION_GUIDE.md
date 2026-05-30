# Complete Google Sheets Contact Form Integration Guide

## Overview
This guide provides step-by-step instructions to implement Google Sheets integration for contact forms in any web application. When users submit a contact form, their data will be automatically saved to a Google Sheet while also sending email notifications.

## Architecture Overview
```
User Form Submission → Next.js API Route → Email (Nodemailer) + Google Sheets (Apps Script)
```

## Prerequisites
- Next.js application
- Gmail account for sending emails
- Google account for Google Sheets and Apps Script
- Basic knowledge of JavaScript and API routes

---

## Step 1: Project Setup and Dependencies

### 1.1 Install Required Dependencies
```bash
npm install nodemailer
```

### 1.2 Create Environment Configuration
Create `src/config/env.js`:
```javascript
// Environment variables with fallback values
const env = {
  // Email Configuration
  NEXT_PUBLIC_EMAIL_USER: process.env.NEXT_PUBLIC_EMAIL_USER || 'your-email@gmail.com',
  NEXT_PUBLIC_EMAIL_APP_PASS: process.env.NEXT_PUBLIC_EMAIL_APP_PASS || 'your-app-password',
  NEXT_PUBLIC_EMAIL_RECEIVER: process.env.NEXT_PUBLIC_EMAIL_RECEIVER || 'receiver@gmail.com',
  
  // Node Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Helper function to get environment variables with fallback
export const getEnv = (key) => {
  if (!(key in env)) {
    console.warn(`Environment variable ${key} is not defined in config`);
    return process.env[key];
  }
  return env[key];
};

// Export all environment variables
export default env;
```

### 1.3 Create Environment Variables File
Create `.env.local` in your project root:
```env
NEXT_PUBLIC_EMAIL_USER=your-gmail@gmail.com
NEXT_PUBLIC_EMAIL_APP_PASSWORD=your-gmail-app-password
NEXT_PUBLIC_EMAIL_RECEIVER=receiver@gmail.com
```

**Important**: 
- Use Gmail App Password, not regular password
- Generate App Password: Google Account → Security → 2-Step Verification → App passwords

---

## Step 2: Google Sheets Setup

### 2.1 Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click "+" to create a new blank spreadsheet
3. Name it "Contact Form Submissions" or similar
4. Copy the Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
   Example: `1eZWf6RKW2WEPvLpeUlQTYIevjGHgjWwpu844UTO3Jpg`

### 2.2 Set Up Column Headers
Add these headers in Row 1:
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Timestamp | Page Source | Form Type | Name | Email | Phone | Message | Extra Info |

---

## Step 3: Google Apps Script Setup

### 3.1 Create Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name your project "Contact Form Handler"

### 3.2 Apps Script Code
Replace the default code with:

```javascript
function doPost(e) {
  try {
    // IMPORTANT: Replace with your actual Google Sheet ID
    const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Update this!
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get current timestamp in IST (or your timezone)
    const getIndianTime = () => {
      const now = new Date();
      const utcTime = now.getTime();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST offset (change as needed)
      const istTime = new Date(utcTime + istOffset);
      
      const year = istTime.getUTCFullYear();
      const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
      const day = String(istTime.getUTCDate()).padStart(2, '0');
      let hours = istTime.getUTCHours();
      const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
      const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const displayHours = String(hours).padStart(2, '0');
      
      return `${day}/${month}/${year}, ${displayHours}:${minutes}:${seconds} ${ampm} (IST)`;
    };
    
    // Prepare row data
    const rowData = [
      getIndianTime(),                           // A: Timestamp
      data.pageSource || 'Contact Page',         // B: Page Source
      data.formType || 'Contact Form',           // C: Form Type
      data.name || '',                           // D: Name
      data.email || '',                          // E: Email
      data.phone || '',                          // F: Phone
      data.message || '',                        // G: Message
      data.extraInfo || ''                       // H: Extra Info
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error saving data: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Google Apps Script is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Function to set up sheet headers (run this once manually)
function setupSheetHeaders() {
  const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Update this!
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  
  const headers = [
    'Timestamp',      // A
    'Page Source',    // B
    'Form Type',      // C
    'Name',           // D
    'Email',          // E
    'Phone',          // F
    'Message',        // G
    'Extra Info'      // H
  ];
  
  // Clear existing headers and add new ones
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4285f4')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
}
```

### 3.3 Deploy Apps Script
1. **Save** the project
2. Click **Deploy** → **New deployment**
3. Select **Web app** from type dropdown
4. Set configuration:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**
6. **Copy the Web App URL** (you'll need this for your API route)
7. Click **Authorize access** and grant permissions

### 3.4 Run Setup Function
1. In Apps Script editor, select `setupSheetHeaders` function
2. Click **Run** to create headers in your sheet
3. Check your Google Sheet to verify headers are added

---

## Step 4: Create Contact Form API Route

### 4.1 Create API Route File
Create `src/app/api/contact-us/route.js`:

```javascript
import nodemailer from 'nodemailer';
import env from '../../../config/env';

export const POST = async (req) => {
  try {
    // Parse the incoming JSON data
    const { name, email, phone, message } = await req.json();

    // Validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, Email, and Message are required!' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Nodemailer transporter setup
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: env.NEXT_PUBLIC_EMAIL_USER,
        pass: env.NEXT_PUBLIC_EMAIL_APP_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Contact Form" <${env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: env.NEXT_PUBLIC_EMAIL_RECEIVER,
      subject: 'New Contact Form Submission',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">New Contact Form Submission</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 10px; border-left: 4px solid #007bff; margin-top: 10px;">
              ${message}
            </div>
          </div>
        </div>
      `,
      text: `New contact form submission from ${name} (${email}): ${message}`,
    };

    // IST time function
    const getIndianTime = () => {
      const now = new Date();
      const utcTime = now.getTime();
      const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const istTime = new Date(utcTime + istOffset);
      const year = istTime.getUTCFullYear();
      const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
      const day = String(istTime.getUTCDate()).padStart(2, '0');
      let hours = istTime.getUTCHours();
      const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
      const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const displayHours = String(hours).padStart(2, '0');
      return `${day}/${month}/${year}, ${displayHours}:${minutes}:${seconds} ${ampm} (IST)`;
    };

    const indianTime = getIndianTime();

    // Send the email
    await transporter.sendMail(mailOptions);

    // Send to Google Sheets
    try {
      const GOOGLE_APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'; // Replace with your URL
      
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSource: 'Contact Us Page',
          formType: 'Contact Us Form',
          name: name || '',
          email: email || '',
          phone: phone || '',
          message: message || '',
          extraInfo: `Submitted from contact form at ${indianTime}`
        }),
      });
      console.log('Contact data sent to Google Sheets successfully');
    } catch (sheetError) {
      console.error('Error sending contact data to Google Sheets:', sheetError);
      // Don't fail the entire request if Google Sheets fails
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error.message);

    return new Response(
      JSON.stringify({ success: false, message: 'Error sending message!' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

**Important**: Replace `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with your actual Apps Script Web App URL.

---

## Step 5: Create Contact Form Component

### 5.1 Basic Contact Form
Create `components/ContactForm.js`:

```javascript
'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: result.message });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitStatus({ type: 'error', message: result.error || 'Something went wrong' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {submitStatus && (
        <div className={`mt-4 p-3 rounded-md ${
          submitStatus.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {submitStatus.message}
        </div>
      )}
    </div>
  );
}
```

---

## Step 6: Testing and Verification

### 6.1 Test the Integration
1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Submit a test form** with sample data

3. **Check multiple places**:
   - Email inbox (should receive email)
   - Google Sheet (should have new row)
   - Browser console (for any errors)

### 6.2 Troubleshooting Common Issues

**Email not sending:**
- Verify Gmail App Password is correct
- Check environment variables are loaded
- Ensure 2-factor authentication is enabled on Gmail

**Google Sheets not updating:**
- Verify Apps Script URL is correct in API route
- Check Apps Script permissions are granted
- Test Apps Script URL directly in browser (should show "Google Apps Script is working!")

**Form submission errors:**
- Check browser console for JavaScript errors
- Verify API route path is correct
- Check network tab for failed requests

---

## Step 7: Customization Options

### 7.1 Add More Form Fields
To add more fields, update:

1. **Contact Form Component**: Add new input fields
2. **API Route**: Handle new fields in request
3. **Apps Script**: Add new columns to rowData array
4. **Google Sheet**: Add corresponding headers

### 7.2 Multiple Form Types
For different form types, you can:
- Create separate API routes (`/api/newsletter`, `/api/support`, etc.)
- Use the same Apps Script but different `formType` values
- Add conditional logic in Apps Script for different data structures

### 7.3 Enhanced Email Templates
Customize the email HTML template in the API route for:
- Better styling
- Company branding
- Additional information
- Attachments (if needed)

---

## Step 8: Production Deployment

### 8.1 Environment Variables
Ensure all environment variables are set in your production environment:
```env
NEXT_PUBLIC_EMAIL_USER=your-production-email@gmail.com
NEXT_PUBLIC_EMAIL_APP_PASSWORD=your-production-app-password
NEXT_PUBLIC_EMAIL_RECEIVER=your-production-receiver@gmail.com
```

### 8.2 Security Considerations
- Never expose email credentials in client-side code
- Use environment variables for all sensitive data
- Consider rate limiting for form submissions
- Add CAPTCHA for spam protection (optional)

### 8.3 Monitoring
- Monitor Google Sheets for data integrity
- Set up email alerts for API failures
- Check Apps Script execution logs regularly

---

## Complete File Structure

```
your-project/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── contact-us/
│   │           └── route.js
│   ├── components/
│   │   └── ContactForm.js
│   └── config/
│       └── env.js
├── .env.local
├── package.json
└── google-apps-script.js (for reference)
```

---

## Summary

This guide provides a complete implementation for:
1. ✅ Contact form with validation
2. ✅ Email notifications via Nodemailer
3. ✅ Google Sheets integration via Apps Script
4. ✅ Error handling and user feedback
5. ✅ Production-ready configuration

The system will automatically:
- Send formatted emails to specified recipients
- Save all form data to Google Sheets with timestamps
- Handle errors gracefully
- Provide user feedback on submission status

You can now share this guide with any developer, and they'll have everything needed to implement the same Google Sheets contact form integration in their project!