import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  template?: 'welcome' | 'order-confirmation' | 'password-reset' | 'verification';
  data?: Record<string, any>;
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private client: Resend | null = null;
  private defaultFrom: string;

  constructor(private configService: ConfigService) {
    super();
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
      // Generate HTML from template if provided
      const emailHtml = template ? this.renderTemplate(template, data || {}) : html;

      if (!this.client) {
        // Development mode - just log
        this.logger.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}`);
        return;
      }

      const result = await this.client.emails.send({
        from: this.defaultFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: emailHtml,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      this.logger.log(`Email sent successfully to ${to}: ${result.data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error; // Triggers retry
    }
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    const templates: Record<string, (d: Record<string, any>) => string> = {
      'welcome': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
          <h1 style="color: #1a1a1a;">Welcome to Our Store! 🎉</h1>
          <p>Hi ${d.name || 'there'},</p>
          <p>Thank you for creating an account. Start shopping now!</p>
        </div>
      `,
      'order-confirmation': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
          <h1 style="color: #1a1a1a;">Order Confirmed ✓</h1>
          <p>Order #${d.orderId}</p>
          <p>Hi ${d.name || 'there'},</p>
          <p>Your order has been confirmed.</p>
          <p style="font-size: 24px; font-weight: bold;">Total: ₦${d.total?.toLocaleString() || '0'}</p>
        </div>
      `,
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

