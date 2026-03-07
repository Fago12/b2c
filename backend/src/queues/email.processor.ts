import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import { PurchaseReceipt } from '../mail/templates/PurchaseReceipt';
import { MailService } from '../mail/mail.service';
import * as React from 'react';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  template?: 'welcome' | 'order-confirmation' | 'password-reset' | 'verification' | 'purchase-receipt' | 'shipping-notification' | 'delivery-confirmation';
  data?: Record<string, any>;
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private client: Resend | null = null;
  private defaultFrom: string;

  constructor(
    private configService: ConfigService,
    private mailService: MailService,
  ) {
    super();
    this.logger.log('EmailProcessor: Instantiated and ready');
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (apiKey) {
      this.client = new Resend(apiKey);
      this.logger.log('EmailProcessor: Resend client initialized');
    } else {
      this.logger.warn('EmailProcessor: RESEND_API_KEY not set - emails will be logged only');
    }
    
    this.defaultFrom = this.configService.get<string>('EMAIL_FROM') 
      || 'onboarding@resend.dev';
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id}: ${job.data.subject}`);
    
    const { to, subject, html, template, data } = job.data;

    try {
      if (template === 'purchase-receipt') {
        this.logger.log(`Using MailService for rich purchase receipt: ${to}`);
        await this.mailService.sendPurchaseReceipt(
          to,
          data?.orderId || 'UNKNOWN',
          data?.total || 0,
          data?.items || [],
          data?.subtotal || 0,
          data?.shippingCost || 0,
          data?.discountAmount || 0,
          data?.currency || 'NGN',
          data?.customerInfo
        );
        return;
      }

      if (template === 'shipping-notification') {
        this.logger.log(`Using MailService for shipping notification: ${to}`);
        await this.mailService.sendShippingEmail(data?.order);
        return;
      }

      if (template === 'delivery-confirmation') {
        this.logger.log(`Using MailService for delivery confirmation: ${to}`);
        await this.mailService.sendDeliveredEmail(data?.order);
        return;
      }

      this.logger.log(`Starting template rendering for ${template || 'no-template'}...`);
      // Generate HTML from template if provided
      const emailHtml = template ? await this.renderTemplate(template, data || {}) : html;
      this.logger.log(`Template rendering complete for ${template}`);

      if (this.client) {
        const result = await this.client.emails.send({
          from: this.defaultFrom,
          to: Array.isArray(to) ? to : [to],
          subject,
          html: emailHtml,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        this.logger.log(`Email sent via Resend to ${to}: ${result.data?.id}`);
      } else {
        // Fallback to MailService (SMTP/Ethereal)
        this.logger.log(`Applying fallback delivery (MailService) for ${to}`);
        await this.mailService.sendGenericEmail(to, subject, emailHtml);
        this.logger.log(`Email sent via MailService fallback to ${to}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error; // Triggers retry
    }
  }

  private async renderTemplate(template: string, data: Record<string, any>): Promise<string> {
    if (template === 'purchase-receipt') {
      return await render(React.createElement(PurchaseReceipt, {
        orderId: data.orderId,
        date: data.customerInfo?.date || new Date().toLocaleDateString(),
        total: data.total,
        items: data.items,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        discountAmount: data.discountAmount,
        currency: data.currency,
        firstName: data.customerInfo?.firstName || '',
        lastName: data.customerInfo?.lastName || '',
        phone: data.customerInfo?.phone || '',
        email: data.to || '',
        shippingAddress: data.customerInfo?.shippingAddress || { line1: '', city: '', state: '', country: '' }
      }));
    }

    const templates: Record<string, (d: Record<string, any>) => string> = {
      'welcome': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
          <h1 style="color: #1a1a1a;">Welcome to Our Store! 🎉</h1>
          <p>Hi ${d.name || 'there'},</p>
          <p>Thank you for creating an account. Start shopping now!</p>
        </div>
      `,
      'order-confirmation': (d) => {
        const items = d.items || [];
        const itemsHtml = items.map((item: any) => `
          <tr>
            <td style="border: 1px solid black; padding: 12px;">
              <div style="font-weight: bold; font-size: 14px;">${item.name}</div>
              ${item.variantDetails ? `<div style="font-size: 12px; color: #666; font-style: italic;">${item.variantDetails}</div>` : ''}
            </td>
            <td style="border: 1px solid black; padding: 12px; text-align: center; font-size: 14px;">${item.quantity}</td>
            <td style="border: 1px solid black; padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">
              ${d.currency || '₦'}${( ( (item.price || 0) * (item.quantity || 1) ) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        `).join('');

        const subtotal = d.subtotal || 0;
        const shipping = d.shippingCost || 0;
        const discount = d.discountAmount || 0;
        const total = d.total || 0;
        const symbol = d.currency === 'NGN' ? '₦' : d.currency === 'USD' ? '$' : (d.currency || '₦');

        return `
        <html lang="en">
        <head>
          <style>
            body { font-family: Verdana, sans-serif; margin: 0; padding: 0; color: #1a1a1a; }
            .header { background: black; color: white; padding: 40px 20px; text-align: center; }
            .header h1 { font-size: 24px; margin: 0; font-weight: normal; text-transform: uppercase; letter-spacing: 2px; }
            .content { padding: 40px 20px; max-width: 600px; margin: auto; }
            .greeting { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
            .sub-greeting { font-size: 14px; margin-bottom: 30px; }
            .order-ref { font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 5px; display: inline-block; }
            
            table { border: 1px solid black; border-collapse: collapse; width: 100%; margin-bottom: 30px; }
            th { border: 1px solid black; padding: 12px; font-size: 14px; font-weight: bold; text-align: left; background: #f2f2f2; }
            td { border: 1px solid black; padding: 12px; font-size: 14px; }
            
            .totals-row { font-weight: 600; }
            .final-total { font-weight: bold; font-size: 16px; background: #f2f2f2; }
            
            .info-section { margin-top: 40px; }
            .info-section h5 { font-size: 16px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; border-left: 4px solid black; padding-left: 10px; }
            .info-grid { font-size: 14px; line-height: 1.6; }
            
            .additional-info { border: 1px solid black; padding: 15px; margin-top: 10px; font-style: italic; font-size: 13px; }
            
            .footer { margin-top: 50px; text-align: center; font-size: 14px; }
            .world-takeover { font-size: 18px; font-weight: bold; color: #480100; margin-top: 20px; }
            .track-btn { background: black; color: white; padding: 15px 30px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Congratulations, your order has been confirmed</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${d.customerInfo?.firstName || d.name || 'Valued Customer'}</div>
            <div class="sub-greeting">We have received your order and are preparing it for shipment.</div>
            
            <div class="order-ref">Order ${String(d.orderId).toUpperCase()} ( ${d.customerInfo?.date || new Date().toLocaleDateString()} )</div>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="totals-row">
                  <td colspan="2">Subtotal</td>
                  <td style="text-align: right;">${symbol}${(subtotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr class="totals-row">
                  <td colspan="2">Shipping</td>
                  <td style="text-align: right;">${symbol}${(shipping / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr class="totals-row" style="color: #dc2626;">
                  <td colspan="2">Discount</td>
                  <td style="text-align: right;">-${symbol}${(discount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr class="final-total">
                  <td colspan="2">TOTAL</td>
                  <td style="text-align: right; font-size: 18px;">${symbol}${(total / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="info-section">
              <h5>Shipping Information</h5>
              <div class="info-grid">
                <strong>Name:</strong> ${d.customerInfo?.firstName} ${d.customerInfo?.lastName}<br>
                <strong>Phone:</strong> ${d.customerInfo?.phone}<br>
                <strong>Email:</strong> ${d.customerInfo?.email}<br>
                <strong>Address:</strong> ${d.customerInfo?.address?.line1}, ${d.customerInfo?.address?.city}, ${d.customerInfo?.address?.state}, ${d.customerInfo?.address?.country}
              </div>
            </div>

            <div class="info-section">
              <h5>Additional Information</h5>
              <div class="additional-info">
                ${d.additionalInfo ? `<div style="margin-bottom: 10px;">${d.additionalInfo}</div>` : ''}
                ${items.some((i: any) => i.customization?.embroideryName || i.customization?.specificInstructions) ? 
                  items.filter((i: any) => i.customization?.embroideryName || i.customization?.specificInstructions).map((item: any) => `
                    <div style="margin-bottom: 5px;">
                      <strong>${item.name}:</strong>
                      ${item.customization.embroideryName ? `<span style="font-size: 11px; text-transform: uppercase; margin-left: 5px;">[Embroidery: ${item.customization.embroideryName}]</span>` : ''}
                      ${item.customization.specificInstructions ? `<div style="margin-left: 15px; margin-top: 2px;">&ldquo;${item.customization.specificInstructions}&rdquo;</div>` : ''}
                    </div>
                  `).join('') : (d.additionalInfo ? '' : 'No additional information')
                }
              </div>
            </div>
            
            <div class="footer">
              <div>Delivery is expected to take ${d.deliveryTime || '3-5 business days'}.</div>
              <div class="world-takeover">Good luck on taking over the world</div>
              
              <a href="https://wovenkulture.com/orders/${d.orderId}" class="track-btn">View Order</a>
              
              <div style="margin-top: 40px; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px;">
                Woven Kulture
              </div>
            </div>
          </div>
        </body>
        </html>
        `;
      },
      'password-reset': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
          <h1 style="color: #1a1a1a;">Reset Your Password</h1>
          <p>Click the button below to reset your password:</p>
          <a href="${d.resetUrl}" style="display: inline-block; background: #000; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Reset Password</a>
          <p style="color: #999; font-size: 14px;">This link expires in 1 hour.</p>
        </div>
      `,
      'verification': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
          <h1 style="color: #1a1a1a;">Verify Your Email</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${d.verifyUrl}" style="display: inline-block; background: #000; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Verify Email</a>
        </div>
      `,
    };

    const templateFn = templates[template];
    if (!templateFn) {
      this.logger.warn(`Unknown template: ${template}`);
      return data.html || '<p>Email content</p>';
    }

    return templateFn(data);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job?.id} failed:`, error.message);
  }
}

