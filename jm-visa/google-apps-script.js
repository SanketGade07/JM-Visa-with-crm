function doPost(e) {
    try {
      // IMPORTANT: Replace this with your actual Google Sheet ID
      // Get it from your sheet URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
      const SHEET_ID = '1eZWf6RKW2WEPvLpeUlQTYIevjGHgjWwpu844UTO3Jpg'; // Update this!
      
      const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
      
      // Parse the incoming data
      const data = JSON.parse(e.postData.contents);
      
      // Get current timestamp in IST
      const getIndianTime = () => {
        const now = new Date();
        const utcTime = now.getTime();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
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
      
      // Prepare row data with only essential fields
      const rowData = [
        getIndianTime(),                           // A: Timestamp
        data.pageSource || 'Unknown',              // B: Page Source
        data.formType || 'Contact Form',           // C: Form Type
        data.name || data.firstName || '',         // D: Full Name
        data.email || '',                          // E: Email
        data.phone || '',                          // F: Phone
        data.message || '',                        // G: Message
        data.visaType || '',                       // H: Visa Type
        data.citizen || '',                        // I: Citizen
        data.travellingTo || '',                   // J: Travelling To
        data.extraInfo || ''                       // K: Extra Info
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
    const SHEET_ID = '1ZYHtsitkThPozmPl3TnmXKi8SD70ZNfF-7-QneYH9E4'; // Updated to match your sheet!
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    const headers = [
      'Timestamp',      // A
      'Page Source',    // B
      'Form Type',      // C
      'Full Name',      // D
      'Email',          // E
      'Phone',          // F
      'Message',        // G
      'Visa Type',      // H
      'Citizen',        // I
      'Travelling To',  // J
      'Extra Info'      // K
    ];
    
    // Clear existing headers and add new ones
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
  }
  