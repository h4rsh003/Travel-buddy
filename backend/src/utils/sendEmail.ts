import dotenv from "dotenv";
import * as Brevo from "@getbrevo/brevo";

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  // 1. Validate Env Variables
  if (!process.env.BREVO_API_KEY) {
    console.error("Internal Error: BREVO_API_KEY is not defined.");
    throw new Error("Email service not configured.");
  }
  
  // Use the variable SENDER_EMAIL from .env, or fallback to your specific email
  const senderEmail = process.env.SENDER_EMAIL || "travel.budddyy@gmail.com";

  // 2. Configure Brevo Instance
  const apiInstance = new Brevo.TransactionalEmailsApi();
  
  // Create authentication using the API key
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

  // 3. Prepare Email
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.html || `<html><body><p>${options.message}</p></body></html>`;
  
  // Sender: Uses the authenticated email from your .env
  sendSmtpEmail.sender = { 
    name: "Travel Buddy", 
    email: senderEmail 
  };
  
  // Recipient
  sendSmtpEmail.to = [{ email: options.email }];

  // 4. Send via HTTP (Works on Render)
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent successfully to ${options.email}. Message ID: ${data.body.messageId}`);
  } catch (error: any) {
    console.error("Brevo Error:", error.response?.body || error.message);
    throw new Error("Email could not be sent due to an external service error.");
  }
};