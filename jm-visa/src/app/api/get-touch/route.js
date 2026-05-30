import nodemailer from "nodemailer";
import env from "../../../config/env";
import { enforceRateLimit, attachRateLimitCookie } from "../../../utils/rateLimit";
import { verifyRecaptchaToken } from "../../../utils/verifyRecaptcha";

export const POST = async (req) => {
  const rateLimit = enforceRateLimit(req);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        message: rateLimit.message,
      }),
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
    // Parse the incoming request body
    const { name, email, phone, other, recaptchaToken, userLocation, userPincode, userIp } = await req.json();

    // Input validation
    if (!name || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Name, Email, and Message are required!",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const captchaResult = await verifyRecaptchaToken(recaptchaToken);

    if (!captchaResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: captchaResult.message || "reCAPTCHA verification failed.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.NEXT_PUBLIC_EMAIL_USER,
        pass: env.NEXT_PUBLIC_EMAIL_APP_PASS,
      },
    });

    // Setup email content
    const mailOptions = {
      from: `"JM Visa Services Contact" <${env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: env.NEXT_PUBLIC_EMAIL_RECEIVER,
      subject: "New Contact Form Submission",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background-color: #007BFF; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 1.8rem; font-weight: bold;">New Contact Form Submission</h1>
          </div>

          <!-- Body -->
          <div style="padding: 20px; background-color: #ffffff; color: #333333;">
            <p style="font-size: 1.1rem; margin-bottom: 10px;">
              <strong>Name:</strong> <span style="color: #007BFF;">${name}</span>
            </p>
             <p style="font-size: 1.1rem; margin-bottom: 10px;">
              <strong>Phone:</strong> <span style="color: #007BFF;">${phone}</span>
            </p>
            <p style="font-size: 1.1rem; margin-bottom: 10px;">
              <strong>Email:</strong> <a href="mailto:${email}" style="color: #007BFF; text-decoration: none;">${email}</a>
            </p>
                </p>
            <!-- Geolocation Details -->
            <div style="margin-top: 20px; padding: 15px; background-color: #f0f7ff; border: 1px dashed #007BFF; border-radius: 8px;">
              <p style="margin: 0 0 5px; font-size: 0.95rem; color: #333333;"><strong>User Location:</strong> ${userLocation || 'Unknown'}</p>
              <p style="margin: 0 0 5px; font-size: 0.95rem; color: #333333;"><strong>Pincode:</strong> ${userPincode || 'Unknown'}</p>
              <p style="margin: 0; font-size: 0.95rem; color: #333333;"><strong>IP Address:</strong> ${userIp || 'Unknown'}</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666666; font-size: 0.9rem;">
            <p style="margin: 0;">This email was sent via the JM Visa Contact Form.</p>
          </div>
        </div>
      `,
      text: `New submission from ${name} (${email},${phone}, ${other}`,
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

    // Send the email to admin
    const info = await transporter.sendMail(mailOptions);

    // Log successful email sending
    console.log("Email sent successfully to admin:", info.messageId);

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
                Thank you for reaching out to <strong>JM Visa Services</strong>. We have successfully received your inquiry and our team will get back to you shortly.
              </p>

              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Your Submission Details:</strong></p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Email:</strong> ${email}</p>
                ${phone ? `<p style="margin: 5px 0; font-size: 0.95rem;"><strong>Phone:</strong> ${phone}</p>` : ''}
                ${other ? `<p style="margin: 5px 0; font-size: 0.95rem;"><strong>Inquiry About:</strong> ${other}</p>` : ''}
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
        text: `Dear ${name},\n\nThank you for reaching out to JM Visa Services. We have successfully received your inquiry and our team will get back to you shortly.\n\nYour Submission Details:\nName: ${name}\nEmail: ${email}\n${phone ? `Phone: ${phone}\n` : ''}${other ? `Inquiry About: ${other}\n` : ''}Submitted On: ${indianTime}\n\nOur visa experts will review your request and contact you within 24-48 hours.\n\nBest regards,\nThe JM Visa Services Team`,
      };

      const confirmationInfo = await transporter.sendMail(confirmationMailOptions);
      console.log("Confirmation email sent successfully to user:", confirmationInfo.messageId);
    } catch (confirmationError) {
      // Log error but don't fail the request - admin email was already sent
      console.error("Error sending confirmation email to user:", confirmationError);
    }

    // Send to Google Sheets
    try {
      const cleanPhone = phone ? phone.replace(/\+/g, '') : '';
      await fetch('https://script.google.com/macros/s/AKfycbyFjUGmoLofjOWl4AwEDRmCG7PRYC0c9CDBB9nkbwe2n8n0ihHJeHhPtoRsXKuXiYZb/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSource: other || 'Contact Form - Home Page',
          formType: 'Contact Form',
          name: name || '',
          email: email || '',
          phone: cleanPhone,
          message: `Contact request from ${name} (${email}) - Phone: ${cleanPhone} [Location: ${userLocation || 'Unknown'} | Pincode: ${userPincode || 'Unknown'} | IP: ${userIp || 'Unknown'}]`,
          extraInfo: `Submitted from contact form at ${indianTime}`
        }),
      });
      console.log('Data sent to Google Sheets successfully');
    } catch (sheetError) {
      console.error('Error sending data to Google Sheets:', sheetError);
    }

    // Send to CRM Webhook
    try {
      const cleanPhone = phone ? phone.replace(/\+/g, '') : '';
      const webhookUrl = process.env.CRM_WEBHOOK_URL || 'http://localhost:3001/api/webhook/website';
      const webhookSecret = process.env.CRM_WEBHOOK_SECRET || 'test_webhook_secret';

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: webhookSecret,
          name: name || '',
          email: email || '',
          phone: cleanPhone,
          countryInterest: 'UK', // Default country department
          service: other || 'General Inquiry', // Visa category or inquiry interest
          source: 'WEBSITE',
          message: `Get-in-Touch request - Inquiry about: ${other || 'N/A'} [Location: ${userLocation || 'Unknown'} | Pincode: ${userPincode || 'Unknown'} | IP: ${userIp || 'Unknown'}]`
        }),
      });
      console.log('Get-touch data sent to CRM Webhook successfully');
    } catch (crmError) {
      console.error('Error sending get-touch data to CRM Webhook:', crmError);
    }

    // Success response
    const response = new Response(
      JSON.stringify({
        success: true,
        message: "Your message has been sent successfully!",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    attachRateLimitCookie(response, rateLimit.cookieValue);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);

    // Error response
    return new Response(
      JSON.stringify({
        success: false,
        message:
          "Something went wrong while sending your message. Please try again later!",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
