
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function main() {
  console.log('--- Testing Email Sending ---');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('User:', process.env.SMTP_USER);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'ayoyemisola@gmail.com', // Sending to self
      subject: "Test Email from Debug Script",
      text: "If you see this, SMTP is working!",
    });
    console.log("✅ Message sent: %s", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

main();
