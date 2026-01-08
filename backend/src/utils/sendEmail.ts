import nodemailer from "nodemailer";

export const sendEmail = async (to: string, otp: string) => {
  try {
    // Sometimes explicit host/port fails where the service wrapper succeeds.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false 
      }
    });

    await transporter.sendMail({
      from: '"Travel Buddy" <noreply@travelbuddy.com>',
      to,
      subject: "Your Verification Code - Travel Buddy",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-w-xs; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="color: #ea580c;">Travel Buddy</h2>
            <p>Welcome! Here is your verification code:</p>
            <h1 style="letter-spacing: 5px; background: #eee; padding: 10px; border-radius: 4px;">${otp}</h1>
            <p style="font-size: 12px; color: #666;">This code expires in 10 minutes.</p>
          </div>
        </div>
      `,
    });
    
    console.log(`📧 Email sent to ${to}`);
    
  } catch (error) {
    console.error("Email send error:", error);
    throw error; 
  }
};