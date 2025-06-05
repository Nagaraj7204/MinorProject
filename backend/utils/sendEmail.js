import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load env variables

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10), // Ensure port is a number
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Optional: Add TLS config if needed, e.g., for local testing or specific providers
    // tls: {
    //   ciphers:'SSLv3'
    // }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `Workopoly <${process.env.EMAIL_USER}>`, // Use EMAIL_FROM if available
    to: options.email,
    subject: options.subject,
    text: options.message, // Plain text content
    html: options.html || options.message, // Use HTML if provided, otherwise fallback to text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true; // Indicate success
  } catch (error) {
    console.error('Error sending email:', error);
    // Depending on criticality, you might want to throw the error
    // throw new Error('Email could not be sent');
    return false; // Indicate failure
  }
};

export default sendEmail;
