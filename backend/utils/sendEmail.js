const axios = require('axios');

const sendEmail = async (userEmail, code) => {
  try {
    // 1. Package the email data exactly how Brevo expects it
    const payload = {
      sender: {
        name: "CampusGig",
        email: process.env.EMAIL_USER // This MUST be justinotjerivanga@gmail.com
      },
      to: [
        { email: userEmail }
      ],
      subject: "Verify your CampusGig Account",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #16a34a; text-align: center;">Welcome to CampusGig!</h2>
          <p style="color: #333; font-size: 16px;">To complete your registration and verify your student status, please use the 6-digit code below:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #1f2937; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `
    };

    // 2. Send the HTTP POST request to Brevo's API
    await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });

    console.log(`✅ Verification email sent successfully via Brevo to ${userEmail}`);
    
  } catch (error) {
    // If Brevo rejects it, this will print the exact reason why!
    console.error("🚨 Brevo Email Error:", error.response ? error.response.data : error.message);
    throw new Error('Could not send verification email');
  }
};

module.exports = sendEmail;