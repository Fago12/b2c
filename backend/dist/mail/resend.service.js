"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ResendService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let ResendService = ResendService_1 = class ResendService {
    configService;
    logger = new common_1.Logger(ResendService_1.name);
    client = null;
    defaultFrom;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY');
        if (apiKey) {
            this.client = new resend_1.Resend(apiKey);
            this.logger.log('Resend client initialized');
        }
        else {
            this.logger.warn('RESEND_API_KEY not set - emails will be logged only');
        }
        this.defaultFrom = this.configService.get('EMAIL_FROM')
            || 'onboarding@resend.dev';
    }
    async sendEmail(options) {
        const { to, subject, html, from, replyTo } = options;
        if (!this.client) {
            this.logger.log(`[DEV] Would send email to ${to}: ${subject}`);
            return { success: true };
        }
        try {
            const result = await this.client.emails.send({
                from: from || this.defaultFrom,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                replyTo,
            });
            if (result.error) {
                this.logger.error('Resend error:', result.error);
                throw new Error(result.error.message);
            }
            this.logger.log(`Email sent successfully: ${result.data?.id}`);
            return { id: result.data?.id, success: true };
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error.message);
            throw error;
        }
    }
    async sendWelcomeEmail(email, name) {
        await this.sendEmail({
            to: email,
            subject: 'Welcome to Our Store!',
            html: this.renderWelcomeEmail(name),
        });
    }
    async sendOrderConfirmation(email, orderId, total, items, name) {
        await this.sendEmail({
            to: email,
            subject: `Order Confirmed - #${orderId}`,
            html: this.renderOrderConfirmation(orderId, total, items, name),
        });
    }
    async sendPasswordReset(email, resetUrl) {
        this.logger.log(`[Password Reset] URL for ${email}: ${resetUrl}`);
        await this.sendEmail({
            to: email,
            subject: 'Reset Your Password',
            html: this.renderPasswordReset(resetUrl),
        });
    }
    async sendVerificationEmail(email, token) {
        const verificationUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/verify?token=${token}`;
        this.logger.log(`[Email Verification] URL for ${email}: ${verificationUrl}`);
        await this.sendEmail({
            to: email,
            subject: 'Verify your email address',
            html: this.renderVerificationEmail(verificationUrl),
        });
    }
    renderWelcomeEmail(name) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background: #f5f5f5; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
            h1 { color: #1a1a1a; margin-bottom: 24px; }
            p { color: #666; line-height: 1.6; }
            .btn { display: inline-block; background: #000; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Our Store! 🎉</h1>
            <p>Hi ${name || 'there'},</p>
            <p>Thank you for creating an account. We're excited to have you join our community.</p>
            <p>Start exploring our curated collection of premium products.</p>
            <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}" class="btn">Start Shopping</a>
          </div>
        </body>
      </html>
    `;
    }
    renderOrderConfirmation(orderId, total, items, name) {
        const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price.toLocaleString()}</td>
      </tr>
    `).join('');
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background: #f5f5f5; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
            h1 { color: #1a1a1a; margin-bottom: 8px; }
            .order-id { color: #666; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            th { background: #f9f9f9; padding: 12px; text-align: left; }
            .total { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Order Confirmed ✓</h1>
            <p class="order-id">Order #${orderId}</p>
            <p>Hi ${name || 'there'},</p>
            <p>Thank you for your order! Here's a summary:</p>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <p class="total">Total: ₦${total.toLocaleString()}</p>
            <p>We'll notify you when your order ships.</p>
          </div>
        </body>
      </html>
    `;
    }
    renderPasswordReset(resetUrl) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background: #f5f5f5; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
            h1 { color: #1a1a1a; margin-bottom: 24px; }
            p { color: #666; line-height: 1.6; }
            .btn { display: inline-block; background: #000; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
            .note { font-size: 14px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="btn">Reset Password</a>
            <p class="note">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `;
    }
    renderVerificationEmail(verificationUrl) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background: #f5f5f5; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
            h1 { color: #1a1a1a; margin-bottom: 24px; }
            p { color: #666; line-height: 1.6; }
            .btn { display: inline-block; background: #000; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify your Email</h1>
            <p>Welcome! Please verify your email by clicking the button below:</p>
            <a href="${verificationUrl}" class="btn">Verify Email</a>
          </div>
        </body>
      </html>
    `;
    }
};
exports.ResendService = ResendService;
exports.ResendService = ResendService = ResendService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResendService);
//# sourceMappingURL=resend.service.js.map