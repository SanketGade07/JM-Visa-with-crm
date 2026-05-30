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
    const { message, recaptchaToken } = await req.json();

    // Validate the message field
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required!' }),
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

    // Email options
    const mailOptions = {
      from: `"Feedback Form" <${env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: env.NEXT_PUBLIC_EMAIL_RECEIVER,
      subject: 'New Feedback Message',
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 20px auto; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0px 4px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background-color: #4f46e5; color: #ffffff; text-align: center; padding: 20px;">
            <h1 style="margin: 0; font-size: 1.8rem; letter-spacing: 1px;">New Feedback Message</h1>
          </div>
          <!-- Content -->
          <div style="padding: 20px; background-color: #ffffff;">
            <p style="margin-bottom: 10px; font-size: 1.1rem; color: #333333;">
              <strong>Message:</strong>
            </p>
            <div style="background-color: #f1f5f9; padding: 15px; border-left: 5px solid #4f46e5; border-radius: 5px; font-size: 1rem; line-height: 1.5; color: #333333;">
              ${message}
            </div>
          </div>
          <!-- Footer -->
          <div style="background-color: #f1f5f9; text-align: center; padding: 15px; font-size: 0.9rem; color: #555555;">
            <p style="margin: 0;">This email was sent from the feedback form on your website.</p>
          </div>
        </div>
      `,
      text: `New feedback message: ${message}`,
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
          pageSource: 'Feedback Page',
          formType: 'Feedback Form',
          message: message || '',
          extraInfo: `Submitted from feedback form at ${indianTime}`
        }),
      });
      console.log('Feedback data sent to Google Sheets successfully');
    } catch (sheetError) {
      console.error('Error sending feedback data to Google Sheets:', sheetError);
    }

    const response = new Response(
      JSON.stringify({ success: true, message: 'Feedback message sent successfully!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    attachRateLimitCookie(response, rateLimit.cookieValue);
    return response;
  } catch (error) {
    console.error('Error sending email:', error.message);

    return new Response(
      JSON.stringify({ success: false, message: 'Error sending message!' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
