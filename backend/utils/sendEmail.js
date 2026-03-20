const nodemailer = require('nodemailer');

const sendEmail = async (userEmail, code) => {
  try {
    // 1. Create the "Postman" using your Gmail credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com', // Explicitly point to Gmail's SMTP
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4, // Force IPv4 to avoid potential IPv6 issues
    });

    // 2. Draft the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Verify your CampusGig Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #16a34a; text-align: center;">Welcome to CampusGig!</h2>
          <p style="color: #333; font-size: 16px;">To complete your registration and verify your student status, please use the 6-digit code below:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #1f2937; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    };

    // 3. Send it!
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error('Could not send verification email');
  }
};

module.exports = sendEmail;