import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { WelcomeEmail } from './templates/WelcomeEmail';
import { PurchaseReceipt } from './templates/PurchaseReceipt';
import { AdminInviteEmail } from './templates/AdminInviteEmail';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.createTransporter();
  }

  async createTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log('MailService: SMTP Transporter Ready');
    } else {
        // Fallback to Ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('MailService: Ethereal Transporter Ready (Fallback)');
        console.log(`Preview URL: https://ethereal.email/messages`);
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    if (!this.transporter) await this.createTransporter();
    
    // Legacy text/html for now, can be upgraded to React Email later
    const verificationUrl = `http://localhost:3000/verify?token=${token}`;
    const info = await this.transporter.sendMail({
      from: '"Woven Kulture" <noreply@wovenkulture.com>',
      to: email,
      subject: 'Verify your email address',
      text: `Welcome! Please verify your email by clicking here: ${verificationUrl}`,
      html: `<b>Welcome!</b><br>Please verify your email by clicking <a href="${verificationUrl}">here</a>.`,
    });
    console.log('Verification Email sent: %s', info.messageId);
    if (!process.env.SMTP_HOST) console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  }

  async sendPasswordResetEmail(email: string, token: string) {
    if (!this.transporter) await this.createTransporter();

    const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;
    const info = await this.transporter.sendMail({
      from: '"Woven Kulture" <noreply@wovenkulture.com>',
      to: email,
      subject: 'Reset your password',
      text: `Reset your password by clicking here: ${resetUrl}`,
      html: `<b>Reset Password</b><br>Click <a href="${resetUrl}">here</a> to reset your password.`,
    });
    console.log('Password Reset Email sent: %s', info.messageId);
    if (!process.env.SMTP_HOST) console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    if (!this.transporter) await this.createTransporter();

    const emailHtml = await render(WelcomeEmail({ firstName }));

    const info = await this.transporter.sendMail({
      from: '"Woven Kulture" <noreply@wovenkulture.com>',
      to: email,
      subject: 'Welcome to Woven Kulture!',
      html: emailHtml,
    });

    console.log('Welcome Email sent: %s', info.messageId);
    if (!process.env.SMTP_HOST) console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  }

  async sendPurchaseReceipt(email: string, orderId: string, total: number, items: any[]) {
    if (!this.transporter) await this.createTransporter();

    const emailHtml = await render(PurchaseReceipt({ orderId, total, items }));

    const info = await this.transporter.sendMail({
      from: '"Woven Kulture" <noreply@wovenkulture.com>',
      to: email,
      subject: `Order Receipt: ${orderId}`,
      html: emailHtml,
    });

    console.log('Purchase Receipt sent: %s', info.messageId);
    if (!process.env.SMTP_HOST) console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  }

  async sendAdminInvite(email: string, inviteUrl: string, inviterName: string) {
    if (!this.transporter) await this.createTransporter();

    const emailHtml = await render(AdminInviteEmail({ inviteUrl, inviterName }));

    const info = await this.transporter.sendMail({
      from: '"Woven Kulture" <noreply@wovenkulture.com>',
      to: email,
      subject: 'You have been invited to join Woven Kulture Admin',
      html: emailHtml,
    });

    console.log('Admin Invite sent: %s', info.messageId);
    if (!process.env.SMTP_HOST) console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  }
}
