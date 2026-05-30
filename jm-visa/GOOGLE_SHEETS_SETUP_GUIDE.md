# Complete Google Sheets Integration Setup Guide

## Overview
This guide will help you set up Google Sheets integration for all your JM Visa website forms. All form submissions will be automatically saved to a Google Sheet with proper tracking of which page the form was submitted from.

## Step 1: Create Google Sheet

1. **Go to Google Sheets**: Visit [sheets.google.com](https://sheets.google.com)
2. **Create New Sheet**: Click "+" to create a new blank spreadsheet
3. **Name Your Sheet**: Give it a descriptive name like "JM Visa Form Submissions"
4. **Get Sheet ID**: From the URL, copy the sheet ID (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/1TBmJ9vG7nvTJ_0y1X-qsjPCSdN0aiGs14rOmlkum5eo/edit`
   - Sheet ID: `1TBmJ9vG7nvTJ_0y1X-qsjPCSdN0aiGs14rOmlkum5eo`

## Step 2: Set Up Google Apps Script

1. **Open Apps Script**: Go to [script.google.com](https://script.google.com)
2. **Create New Project**: Click "New Project"
3. **Replace Code**: Delete the default code and paste the code from `google-apps-script.js` file
4. **Update Sheet ID**: In the script, replace the sheet ID with your actual sheet ID:
   ```javascript
   const sheet = SpreadsheetApp.openById('YOUR_ACTUAL_SHEET_ID_HERE').getActiveSheet();
   ```

## Step 3: Deploy the Apps Script

1. **Save Project**: Click "Save" and give your project a name
2. **Deploy**: Click "Deploy" > "New deployment"
3. **Select Type**: Choose "Web app" from the dropdown
4. **Set Permissions**:
   - Execute as: "Me"
   - Who has access: "Anyone"
5. **Deploy**: Click "Deploy"
6. **Copy URL**: Copy the web app URL (this is your Google Apps Script endpoint)
7. **Authorize**: Click "Authorize access" and grant necessary permissions

## Step 4: Set Up Sheet Headers (One-time setup)

1. **Run Setup Function**: In Apps Script editor, select `setupSheetHeaders` function
2. **Click Run**: This will create proper column headers in your sheet
3. **Verify**: Check your Google Sheet to ensure headers are added

## Step 5: Update API Routes (Already Done)

All your API routes have been updated with Google Sheets integration:

### Updated Routes:
- ✅ `/api/contact-us` - Contact form submissions
- ✅ `/api/get-touch` - Get touch form submissions  
- ✅ `/api/send-franchise-email` - Franchise applications
- ✅ `/api/submitFeedback` - Feedback submissions
- ✅ `/api/termsform` - Terms consent requests
- ✅ `/api/visa-form` - Visa application forms

### What Each Route Sends to Google Sheets:
Each form submission includes:
- **Timestamp**: IST time when form was submitted
- **Page Source**: Which page the form was submitted from
- **Form Type**: Type of form (Contact, Franchise, etc.)
- **User Data**: Name, email, phone, message, etc.
- **Extra Info**: Additional context about the submission

## Step 6: Environment Variables

Make sure your `.env.local` file has these variables:
```env
NEXT_PUBLIC_EMAIL_USER=your-gmail@gmail.com
NEXT_PUBLIC_EMAIL_APP_PASSWORD=your-app-password
NEXT_PUBLIC_EMAIL_RECEIVER=receiver@gmail.com
```

## Step 7: Test the Integration

1. **Submit Test Forms**: Try submitting forms from different pages of your website
2. **Check Google Sheet**: Verify that data appears in your Google Sheet
3. **Check Console**: Look for success/error messages in browser console
4. **Verify Data**: Ensure all form fields are being captured correctly

## Google Sheet Column Structure

Your Google Sheet will have these columns:

| Column | Field | Description |
|--------|-------|-------------|
| A | Timestamp | When form was submitted (IST) |
| B | Page Source | Which page form was submitted from |
| C | Form Type | Type of form (Contact, Franchise, etc.) |
| D | First Name | User's first name |
| E | Last Name | User's last name |
| F | Full Name | Complete name (for single name fields) |
| G | Email | User's email address |
| H | Phone | User's phone number |
| I | Message | User's message/feedback |
| J | Visa Type | Type of visa (if applicable) |
| K | Country | Country information |
| L | Citizen | Citizenship information |
| M | Travelling To | Destination country |
| N | Category | Visa category |
| O | Experience | Experience details (franchise) |
| P | Rating | User rating/feedback |
| Q | Other Info | Additional information |
| R | Extra Info | System-generated extra information |

## Form Type Mapping

Each form sends a specific `formType` to identify the source:

- **Contact Form** → `Contact Form`
- **Get Touch Form** → `Get Touch Form`
- **Franchise Application** → `Franchise Application`
- **Feedback Form** → `Feedback Form`
- **Terms Consent** → `Terms Consent`
- **Visa Application** → `Visa Application Form`

## Page Source Tracking

The system automatically tracks which page the form was submitted from:

- Home page forms → `Home Page`
- Blog page forms → `Blog Contact`
- Franchise page → `Franchise Page`
- Feedback page → `Feedback Page`
- Terms page → `Terms Page`
- Visa application page → `Visa Application Page`

## Troubleshooting

### Common Issues:

1. **Data Not Appearing in Sheet**:
   - Check Apps Script deployment URL is correct
   - Verify sheet ID in Apps Script
   - Check browser console for errors

2. **Permission Errors**:
   - Re-authorize Apps Script permissions
   - Ensure sheet is accessible to the script

3. **Missing Data**:
   - Check form field names match API expectations
   - Verify all required fields are being sent

4. **Timestamp Issues**:
   - IST time function is built-in and should work automatically

### Testing Steps:

1. Submit a test form from each page
2. Check Google Sheet for new rows
3. Verify all data fields are populated correctly
4. Check browser console for any error messages

## Security Notes

- The Google Apps Script URL is public but only accepts POST requests
- No sensitive data should be logged in console in production
- Consider adding rate limiting if needed
- The sheet ID should be kept secure

## Maintenance

- Regularly check the Google Sheet for data integrity
- Monitor API logs for any errors
- Keep the Apps Script deployment active
- Backup your Google Sheet data periodically

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify the Apps Script is deployed and accessible
3. Test the Apps Script endpoint directly
4. Ensure all environment variables are set correctly

---

**Note**: All API routes have been updated with Google Sheets integration. The system will continue to send emails as before, but now also saves all form data to your Google Sheet for easy tracking and analysis.
