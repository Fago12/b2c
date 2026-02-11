import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobData } from './email.processor';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  /**
   * Add email job to the queue
   */
  async sendEmail(data: EmailJobData, priority: number = 0): Promise<void> {
    await this.emailQueue.add('send', data, {
      priority,
      delay: 0,
    });
    this.logger.log(`Email job queued for: ${data.to}`);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Our Store!',
      html: '',
      template: 'welcome',
      data: { name },
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    email: string,
    orderId: string,
    total: number,
    name?: string,
  ): Promise<void> {
    await this.sendEmail(
      {
        to: email,
        subject: `Order Confirmed - #${orderId}`,
        html: '',
        template: 'order-confirmation',
        data: { orderId, total, name },
      },
      1, // Higher priority for order emails
    );
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    await this.sendEmail(
      {
        to: email,
        subject: 'Reset Your Password',
        html: '',
        template: 'password-reset',
        data: { resetUrl },
      },
      2, // High priority for password resets
    );
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email: string, verifyUrl: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email',
      html: '',
      template: 'verification',
      data: { verifyUrl },
    });
  }

  /**
   * Get queue stats
   */
  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}
