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
    const { name, email, phone, message, recaptchaToken, userLocation, userPincode, userIp } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, Email, and Message are required!' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const captchaResult = await verifyRecaptchaToken(recaptchaToken);

    if (!captchaResult.success) {
      return new Response(
        JSON.stringify({ success: false, message: captchaResult.message || 'reCAPTCHA verification failed. Please try again.' }),
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
      from: `"JM Visa Services Contact" <${env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: env.NEXT_PUBLIC_EMAIL_RECEIVER, // Receiver's email
      subject: 'New Contact Form Submission',
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 20px auto; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0px 4px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background-color: #4f46e5; color: #ffffff; text-align: center; padding: 20px;">
            <h1 style="margin: 0; font-size: 1.8rem; letter-spacing: 1px;">New Contact Form Submission</h1>
          </div>
          <!-- Content -->
          <div style="padding: 20px; background-color: #ffffff;">
            <p style="margin-bottom: 10px; font-size: 1.1rem; color: #333333;">
              <strong>Name:</strong> <span style="color: #4f46e5;">${name}</span>
            </p>
            <p style="margin-bottom: 10px; font-size: 1.1rem; color: #333333;">
              <strong>Email:</strong> <span style="color: #4f46e5;">${email}</span>
            </p>
            <p style="margin-bottom: 10px; font-size: 1.1rem; color: #333333;">
              <strong>Phone:</strong> <span style="color: #4f46e5;">${phone || 'N/A'}</span>
            </p>
            <div style="background-color: #f1f5f9; padding: 15px; border-left: 5px solid #4f46e5; border-radius: 5px; font-size: 1rem; line-height: 1.5; color: #333333;">
              ${message}
            </div>
            <!-- Geolocation Details -->
            <div style="margin-top: 20px; padding: 15px; background-color: #eef2ff; border: 1px dashed #4f46e5; border-radius: 8px;">
              <p style="margin: 0 0 5px; font-size: 0.9rem; color: #333333;"><strong>User Location:</strong> ${userLocation || 'Unknown'}</p>
              <p style="margin: 0 0 5px; font-size: 0.9rem; color: #333333;"><strong>Pincode:</strong> ${userPincode || 'Unknown'}</p>
              <p style="margin: 0; font-size: 0.9rem; color: #333333;"><strong>IP Address:</strong> ${userIp || 'Unknown'}</p>
            </div>
          </div>
          <!-- Footer -->
          <div style="background-color: #f1f5f9; text-align: center; padding: 15px; font-size: 0.9rem; color: #555555;">
            <p style="margin: 0;">This email was sent from the JM Visa contact form.</p>
          </div>
        </div>
      `,
      text: `New submission from ${name} (${email}, ${phone || 'N/A'}): ${message}`,
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

    // Send the email to admin
    await transporter.sendMail(mailOptions);

    // Send confirmation email to the person who submitted the form
    try {
      const confirmationMailOptions = {
        from: `"JM Visa Services" <${env.NEXT_PUBLIC_EMAIL_USER}>`,
        to: email,
        subject: "Thank You for Contacting JM Visa Services",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background-color: #007BFF; color: #ffffff; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 1.8rem; font-weight: bold;">Thank You for Contacting Us!</h1>
            </div>

            <!-- Body -->
            <div style="padding: 20px; background-color: #ffffff; color: #333333;">
              <p style="font-size: 1.1rem; margin-bottom: 15px;">Dear ${name},</p>
              
              <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 15px;">
                Thank you for reaching out to <strong>JM Visa Services</strong>. We have successfully received your message and our team will get back to you shortly.
              </p>

              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Your Submission Details:</strong></p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Email:</strong> ${email}</p>
                ${phone ? `<p style="margin: 5px 0; font-size: 0.95rem;"><strong>Phone:</strong> ${phone}</p>` : ''}
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Message:</strong> ${message}</p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Submitted On:</strong> ${indianTime}</p>
              </div>

              <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 15px;">
                Our visa experts will review your request and contact you within 24-48 hours. If you have any urgent queries, please feel free to reach us directly.
              </p>

              <div style="margin: 20px 0; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #007BFF; border-radius: 4px;">
                <p style="margin: 0; font-size: 0.95rem;"><strong>Need Immediate Assistance?</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 0.95rem;">
                  📞 Call us: <a href="tel:+919321315524" style="color: #007BFF; text-decoration: none;">+91 9321315524</a><br>
                  📧 Email: <a href="mailto:info@jmvisaservices.com" style="color: #007BFF; text-decoration: none;">info@jmvisaservices.com</a><br>
                  💬 WhatsApp: <a href="https://wa.me/+919321315524" style="color: #007BFF; text-decoration: none;">+91 9321315524</a>
                </p>
              </div>

              <p style="font-size: 1rem; line-height: 1.6; margin-top: 20px;">
                Best regards,<br>
                <strong>The JM Visa Services Team</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666666; font-size: 0.9rem;">
              <p style="margin: 0;">This is an automated confirmation email. Please do not reply to this email.</p>
              <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} JM Visa Services. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `Dear ${name},\n\nThank you for reaching out to JM Visa Services. We have successfully received your message and our team will get back to you shortly.\n\nYour Submission Details:\nName: ${name}\nEmail: ${email}\n${phone ? `Phone: ${phone}\n` : ''}Message: ${message}\nSubmitted On: ${indianTime}\n\nOur visa experts will review your request and contact you within 24-48 hours.\n\nBest regards,\nThe JM Visa Services Team`,
      };

      await transporter.sendMail(confirmationMailOptions);
      console.log("Confirmation email sent successfully to user");
    } catch (confirmationError) {
      console.error("Error sending confirmation email to user:", confirmationError);
    }

    // Send to Google Sheets
    try {
      await fetch('https://script.google.com/macros/s/AKfycbyFjUGmoLofjOWl4AwEDRmCG7PRYC0c9CDBB9nkbwe2n8n0ihHJeHhPtoRsXKuXiYZb/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSource: 'Contact Us Page',
          formType: 'Contact Us Form',
          name: name || '',
          email: email || '',
          phone: phone ? phone.replace(/\+/g, '') : '',
          message: `${message || ''} [Location: ${userLocation || 'Unknown'} | Pincode: ${userPincode || 'Unknown'} | IP: ${userIp || 'Unknown'}]`,
          extraInfo: `Submitted from contact-us form at ${indianTime}`
        }),
      });
      console.log('Contact-us data sent to Google Sheets successfully');
    } catch (sheetError) {
      console.error('Error sending contact-us data to Google Sheets:', sheetError);
    }

    // Send to CRM Webhook
    try {
      const webhookUrl = process.env.CRM_WEBHOOK_URL || 'http://localhost:3001/api/webhook/website';
      const webhookSecret = process.env.CRM_WEBHOOK_SECRET || 'test_webhook_secret';

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: webhookSecret,
          name: name || '',
          email: email || '',
          phone: phone || '',
          countryInterest: 'UK',
          service: 'Contact Inquiry',
          source: 'WEBSITE',
          message: `${message || ''} [Location: ${userLocation || 'Unknown'} | Pincode: ${userPincode || 'Unknown'} | IP: ${userIp || 'Unknown'}]`
        }),
      });
      console.log('Contact-us data sent to CRM Webhook successfully');
    } catch (crmError) {
      console.error('Error sending contact-us data to CRM Webhook:', crmError);
    }

    const response = new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully!' }),
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
