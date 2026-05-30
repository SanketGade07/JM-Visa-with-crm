import nodemailer from "nodemailer";
import env from "../../../config/env";
import { enforceRateLimit, attachRateLimitCookie } from "../../../utils/rateLimit";
import { verifyRecaptchaToken } from "../../../utils/verifyRecaptcha";

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
    const { citizen, travellingTo, category, firstName, email, phoneNumber, pageSource, recaptchaToken, userLocation, userPincode, userIp } = await req.json();

    // Validate required fields
    if (!firstName || !email || !travellingTo) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const captchaResult = await verifyRecaptchaToken(recaptchaToken);

    if (!captchaResult.success) {
      return new Response(
        JSON.stringify({ success: false, message: captchaResult.message || "reCAPTCHA verification failed." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.NEXT_PUBLIC_EMAIL_USER,
        pass: env.NEXT_PUBLIC_EMAIL_APP_PASS,
      },
    });

    // HTML Email Content
    const mailOptions = {
      from: `"Visa Form Submission" <${env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: env.NEXT_PUBLIC_EMAIL_RECEIVER,
      subject: "New Visa Application Submission",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <div style="background-color: #4a90e2; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 1.8rem;">Visa Application Form Submission</h1>
          </div>

          <!-- Body -->
          <div style="padding: 20px; background-color: #ffffff;">
            <p style="font-size: 1.1rem; margin: 0 0 10px;"><strong>Citizen:</strong> <span style="color: #4a90e2;">${citizen}</span></p>
            <p style="font-size: 1.1rem; margin: 0 0 10px;"><strong>Travelling To:</strong> <span style="color: #4a90e2;">${travellingTo}</span></p>
            <p style="font-size: 1.1rem; margin: 0 0 10px;"><strong>Category:</strong> <span>${category}</span></p>
            <p style="font-size: 1.1rem; margin: 0 0 10px;"><strong>Name:</strong> ${firstName}</p>
            <p style="font-size: 1.1rem; margin: 0 0 10px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #4a90e2; text-decoration: none;">${email}</a></p>
            <p style="font-size: 1.1rem; margin: 0 0 10px;"><strong>Phone:</strong> ${phoneNumber || "N/A"}</p>
            
            <!-- Geolocation Details -->
            <div style="margin-top: 20px; padding: 15px; background-color: #f0f7ff; border: 1px dashed #4a90e2; border-radius: 8px;">
              <p style="margin: 0 0 5px; font-size: 0.95rem; color: #333333;"><strong>User Location:</strong> ${userLocation || 'Unknown'}</p>
              <p style="margin: 0 0 5px; font-size: 0.95rem; color: #333333;"><strong>Pincode:</strong> ${userPincode || 'Unknown'}</p>
              <p style="margin: 0; font-size: 0.95rem; color: #333333;"><strong>IP Address:</strong> ${userIp || 'Unknown'}</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #777777; font-size: 0.9rem;">
            <p style="margin: 0;">This email was generated from the Visa Application Form on JM Visa Services.</p>
          </div>
        </div>
      `,
      text: `Visa Form Submission:\nCitizen: ${citizen}\nTravelling To: ${travellingTo}\nCategory: ${category}\nName: ${firstName}\nEmail: ${email}\nPhone: ${phoneNumber || "N/A"}`,
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
    await transporter.sendMail(mailOptions);

    // Send confirmation email to the person who submitted the form
    try {
      const confirmationMailOptions = {
        from: `"JM Visa Services" <${env.NEXT_PUBLIC_EMAIL_USER}>`,
        to: email,
        subject: "Thank You for Your Visa Application - JM Visa Services",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background-color: #007BFF; color: #ffffff; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 1.8rem; font-weight: bold;">Thank You for Your Application!</h1>
            </div>

            <!-- Body -->
            <div style="padding: 20px; background-color: #ffffff; color: #333333;">
              <p style="font-size: 1.1rem; margin-bottom: 15px;">Dear ${firstName},</p>
              
              <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 15px;">
                Thank you for submitting your visa application to <strong>JM Visa Services</strong>. We have successfully received your application and our team will review it shortly.
              </p>

              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Your Application Details:</strong></p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Name:</strong> ${firstName}</p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Email:</strong> ${email}</p>
                ${phoneNumber ? `<p style="margin: 5px 0; font-size: 0.95rem;"><strong>Phone:</strong> ${phoneNumber}</p>` : ''}
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Citizen of:</strong> ${citizen}</p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Travelling To:</strong> ${travellingTo}</p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Category:</strong> ${category}</p>
                <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Submitted On:</strong> ${indianTime}</p>
              </div>

              <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 15px;">
                Our visa experts will review your application and contact you within 24-48 hours with the next steps. If you have any urgent queries, please feel free to reach us directly.
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
        text: `Dear ${firstName},\n\nThank you for submitting your visa application to JM Visa Services. We have successfully received your application and our team will review it shortly.\n\nYour Application Details:\nName: ${firstName}\nEmail: ${email}\n${phoneNumber ? `Phone: ${phoneNumber}\n` : ''}Citizen of: ${citizen}\nTravelling To: ${travellingTo}\nCategory: ${category}\nSubmitted On: ${indianTime}\n\nOur visa experts will review your application and contact you within 24-48 hours.\n\nBest regards,\nThe JM Visa Services Team`,
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
          pageSource: pageSource || 'Visa Application - Unknown Page',
          formType: 'Visa Application',
          name: firstName || '',
          email: email || '',
          phone: phoneNumber ? phoneNumber.replace(/\+/g, '') : '',
          message: `Visa application for ${travellingTo} - Category: ${category} [Location: ${userLocation || 'Unknown'} | Pincode: ${userPincode || 'Unknown'} | IP: ${userIp || 'Unknown'}]`,
          visaType: category || '',
          citizen: citizen || '',
          travellingTo: travellingTo || '',
          extraInfo: `Submitted from visa form at ${indianTime}`
        }),
      });
      console.log('Visa form data sent to Google Sheets successfully');
    } catch (sheetError) {
      console.error('Error sending visa form data to Google Sheets:', sheetError);
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
          name: firstName || '',
          email: email || '',
          phone: phoneNumber || '',
          countryInterest: travellingTo || '', // The webhook endpoint handles normalization
          service: category || 'Visa Application',
          source: 'WEBSITE',
          message: `Visa application for travelling to: ${travellingTo} (Citizen of: ${citizen || 'N/A'}) [Location: ${userLocation || 'Unknown'} | Pincode: ${userPincode || 'Unknown'} | IP: ${userIp || 'Unknown'}]`
        }),
      });
      console.log('Visa form data sent to CRM Webhook successfully');
    } catch (crmError) {
      console.error('Error sending visa form data to CRM Webhook:', crmError);
    }

    const response = new Response(
      JSON.stringify({ success: true, message: "Form submitted successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    attachRateLimitCookie(response, rateLimit.cookieValue);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);

    return new Response(
      JSON.stringify({ success: false, message: "Server error, please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
