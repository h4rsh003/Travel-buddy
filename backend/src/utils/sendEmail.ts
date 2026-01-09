import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string; 
  html?: string; 
}

export const sendEmail = async (options: EmailOptions) => {
  if (!options.email) {
    console.error("sendEmail Error: No recipient email provided.");
    throw new Error("No recipient email provided (options.email is undefined).");
  }

  // 1. Create a Transporter (The service that sends mail)
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.SMTP_EMAIL, 
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: `"Travel Buddy" <${process.env.SMTP_EMAIL}>`, 
    to: options.email, 
    subject: options.subject, 
    text: options.message, 
    html: options.html, 
  };

  await transporter.sendMail(mailOptions);
};