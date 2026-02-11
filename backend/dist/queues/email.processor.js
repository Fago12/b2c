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
var EmailProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const resend_1 = require("resend");
const config_1 = require("@nestjs/config");
let EmailProcessor = EmailProcessor_1 = class EmailProcessor extends bullmq_1.WorkerHost {
    configService;
    logger = new common_1.Logger(EmailProcessor_1.name);
    client = null;
    defaultFrom;
    constructor(configService) {
        super();
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY');
        if (apiKey) {
            this.client = new resend_1.Resend(apiKey);
            this.logger.log('EmailProcessor: Resend client initialized');
        }
        else {
            this.logger.warn('EmailProcessor: RESEND_API_KEY not set - emails will be logged only');
        }
        this.defaultFrom = this.configService.get('EMAIL_FROM')
            || 'onboarding@resend.dev';
    }
    async process(job) {
        this.logger.log(`Processing email job ${job.id}: ${job.data.subject}`);
        const { to, subject, html, template, data } = job.data;
        try {
            const emailHtml = template ? this.renderTemplate(template, data || {}) : html;
            if (!this.client) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
    }
    renderTemplate(template, data) {
        const templates = {
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
    onCompleted(job) {
        this.logger.debug(`Job ${job.id} completed`);
    }
    onFailed(job, error) {
        this.logger.error(`Job ${job?.id} failed:`, error.message);
    }
};
exports.EmailProcessor = EmailProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], EmailProcessor.prototype, "onCompleted", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], EmailProcessor.prototype, "onFailed", null);
exports.EmailProcessor = EmailProcessor = EmailProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('email'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map