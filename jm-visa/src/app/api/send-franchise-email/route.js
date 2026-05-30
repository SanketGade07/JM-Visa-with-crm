import nodemailer from 'nodemailer';
import env from '../../../config/env';

export const POST = async (req) => {
  try {
    // Parse the incoming JSON data
    const { name, email, phone, experience } = await req.json();

    // Validate required fields
    if (!name || !email || !phone || !experience) {
      return new Response(
        JSON.stringify({ error: 'All fields are required!' }),
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
      from: `"JM Visa Franchise" <${env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: env.NEXT_PUBLIC_EMAIL_RECEIVER,
      subject: 'New Franchise Application',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Franchise Application
          </h2>
          <div style="margin-top: 20px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Experience:</strong></p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${experience}
            </div>
          </div>
          <div style="margin-top: 30px; color: #64748b; font-size: 0.9em;">
            Sent from JM Visa Franchise Application Form
          </div>
        </div>
      `,
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
          pageSource: 'Franchise Page',
          formType: 'Franchise Application',
          name: name || '',
          email: email || '',
          phone: phone ? phone.replace(/\+/g, '') : '',
          experience: experience || '',
          message: experience || '',
          extraInfo: `Submitted from franchise form at ${indianTime}`
        }),
      });
      console.log('Franchise data sent to Google Sheets successfully');
    } catch (sheetError) {
      console.error('Error sending franchise data to Google Sheets:', sheetError);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Application submitted successfully!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error.message);

    return new Response(
      JSON.stringify({ success: false, message: 'Error submitting application' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
