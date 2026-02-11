
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function main() {
  const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('email-result.txt', msg + '\n');
  };

  log('--- Testing Email Sending 2 ---');
  
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
      to: 'ayoyemisola@gmail.com',
      subject: "Test Email from Debug Script 2",
      text: "If you see this, SMTP is working!",
    });
    log("✅ Message sent: " + info.messageId);
  } catch (error) {
    log("❌ Error sending email: " + error.message);
  }
}

main();
