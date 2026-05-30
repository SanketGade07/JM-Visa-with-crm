import nodemailer from 'nodemailer';
import env from '../../../config/env';
import { enforceRateLimit, attachRateLimitCookie } from '../../../utils/rateLimit';
import { verifyRecaptchaToken } from '../../../utils/verifyRecaptcha';

export const POST = async (req) => {
  const rateLimit = enforceRateLimit(req);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ success: false, message: rateLimit.message }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": rateLimit.retryAfterSeconds.toString(),
        },
      }
    );
  }

  try {
    // Parse the incoming JSON data
    const { name, email, phone, recaptchaToken } = await req.json();

    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: 'Name, Email, and Phone are required!' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const captchaResult = await verifyRecaptchaToken(recaptchaToken);

    if (!captchaResult.success) {
      return new Response(
        JSON.stringify({ success: false, message: captchaResult.message || 'reCAPTCHA verification failed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Nodemailer transporter setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.NEXT_PUBLIC_EMAIL_USER,
        pass: env.NEXT_PUBLIC_EMAIL_APP_PASS,
      },
    });

    // Email content for Terms and Conditions consent
    const emailContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consent for Visa Application Services</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #4f46e5;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 1.8rem;
      letter-spacing: 1px;
    }
    .content {
      padding: 20px;
      color: #333333;
    }
    .content p {
      font-size: 1.1rem;
      line-height: 1.5;
    }
    .content strong {
      font-size: 1.1rem;
    }
    .footer {
      background-color: #f1f5f9;
      text-align: center;
      padding: 15px;
      font-size: 0.9rem;
      color: #555555;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Terms and Conditions</h1>
    </div>
    <div class="content">
      <p>Dear Applicant,</p>
      <p>Thank you for choosing JM Visa Services for your visa assistance. We value your trust and are committed to providing professional guidance throughout the visa application process. Kindly review the following terms and conditions carefully:</p>

      <p><strong>1. Introduction</strong><br>
        By using JM Visa Services, you agree to our terms. We assist with visa applications but do not guarantee approval.
      </p>

      <p><strong>2. Services Provided</strong><br>
        We process tourist, business, and student visas. The final decision is made by the immigration authorities. We also process every visa for which the client is eligible and in accordance with the rules.
      </p>

      <p><strong>3. Client Responsibilities</strong></p>
      <ul>
        <li>Clients must provide accurate documents and comply with visa rules.</li>
        <li>We process and hand over your visa but are not responsible for your actions afterward.</li>
        <li>We issue tourist visa, if you do any illegal activities on this visa at any country, we are not responsible.</li>
      </ul>

      <p><strong>4. Fees and Payments</strong></p>
      <ul>
        <li>Service fees cover processing and consultation only; embassy fees are separate.</li>
        <li>Our Service Fees are non-refundable once processing begins.</li>
      </ul>

      <p><strong>5. No Guarantee of Approval</strong><br>
        The visa decision rests solely with the consulate/embassy, and we have no control or influence over their decision.
      </p>

      <p><strong>6. Confidentiality</strong><br>
        We protect your data but are not liable for breaches beyond our control.
      </p>

      <p><strong>7. Limitation of Liability</strong><br>
        We are not responsible for delays, rejections, or policy changes by immigration authorities.
      </p>

      <p><strong>8. Refund Policy</strong><br>
        No refunds are issued after submission, even if the visa is rejected.
      </p>

      <p><strong>9. Termination of Services</strong><br>
        We may refuse service for false information, non-payment, or unethical conduct.
      </p>

      <p><strong>10. Governing Law</strong><br>
        These terms are governed by the laws of our country.
      </p>

      <p><strong>Terms and Conditions:</strong></p>
      <ul>
        <li>This is a basic document list; the Embassy reserves the right to request additional documents after submission. These must be provided for further processing.</li>
        <li>Confirmed air tickets and hotel bookings are not mandatory for the visa process.</li>
        <li>JM Visa Services is not responsible for the cost of confirmed air tickets and hotel bookings purchased before or during the visa process and decision.</li>
        <li>We cannot influence visa decisions or processing times in any manner.</li>
        <li>Visa fees are non-refundable once paid to the authorities under any circumstances.</li>
        <li>JM Visa Services charges and air ticket blocking charges are non-refundable once the application is submitted, regardless of the circumstances.</li>
        <li>We do not have any influence over visa processing and decision-making processes.</li>
        <li>We cannot expedite the visa process once an application is submitted.</li>
        <li>All communications will be conducted via our company landline and email address only.</li>
        <li>Document exchange will occur via email only.</li>
        <li>Documents in regional languages must be duly translated into English.</li>
      </ul>

      <p style="font-size: 1.1rem; color: #333333; margin-top: 20px;">
        <strong>By replying to this email with "I Agree," you confirm that you have read, understood, and accepted the above terms and conditions.</strong>
      </p>

      <div style="background-color: #f1f5f9; text-align: center; padding: 15px; font-size: 0.9rem; color: #555555; margin-top: 30px;">
        <p style="margin: 0;">For any questions regarding these Terms and Conditions, you can reach us at:</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:info@jmvisaservices.com">info@jmvisaservices.com</a></p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:+919321315524">+91 9321315524</a> | <a href="tel:+918591070718">+91 8591070718</a></p>
        <p style="margin: 5px 0;"><strong>Head Office:</strong> Shop No 11, City Light CHS, CBSE School, Plot No.25, near Terna Orchids The International School, Sector 1, Kopar Khairane, Navi Mumbai, Maharashtra 400709</p>
        <p style="margin: 5px 0;"><strong>Branch Office:</strong> Ballal Sankul, 3rd Floor, Charwark, Chowk, Indira Nagar, Nashik, Maharashtra - 422009</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Email options
    const mailOptions = {
      from: `"JM Visa Services" <${env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: email,
      subject: 'Consent for Visa Application Services',
      html: emailContent,
    };

    // Aggressive IST time function
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
      await fetch('https://script.google.com/macros/s/AKfycbyFjUGmoLofjOWl4AwEDRmCG7PRYC0c9CDBB9nkbwe2n8n0ihHJeHhPtoRsXKuXiYZb/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSource: 'Terms Page',
          formType: 'Terms Consent',
          name: name || '',
          email: email || '',
          phone: phone ? phone.replace(/\+/g, '') : '',
          extraInfo: `Terms consent requested at ${indianTime}`
        }),
      });
      console.log('Terms data sent to Google Sheets successfully');
    } catch (sheetError) {
      console.error('Error sending terms data to Google Sheets:', sheetError);
    }

    const response = new Response(
      JSON.stringify({ success: true, message: 'Consent email sent successfully!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    attachRateLimitCookie(response, rateLimit.cookieValue);
    return response;
  } catch (error) {
    console.error('Error sending email:', error.message);

    return new Response(
      JSON.stringify({ success: false, message: 'Error sending email!' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
