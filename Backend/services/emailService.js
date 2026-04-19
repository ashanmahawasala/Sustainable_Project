//emailService.js
/* Importing nodemailer library to send emails to 
users when their pickup request status changes */
import nodemailer from "nodemailer";

// Function to send email when pickup status changes
export const sendStatusEmail = async ({ to, itemName, status }) => {
  try {

    // Create email transporter using gmail service
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail address from .env
        pass: process.env.EMAIL_PASS, //Gmail App password from .env
      },
    });

    // Verify email login connection
    await transporter.verify();

    // Email Subject
    const subject = `EcoCycle Pickup Update: ${status}`;
    // Email msg content
    const text = `Hello,

Your pickup request for "${itemName}" has been updated.

Current Status: ${status}

EcoCycle Team`;

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    // Log success msg with message ID
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    // Log error if email sending fails
    console.log("Email send failed:", err.message);
    throw err;
  }
};