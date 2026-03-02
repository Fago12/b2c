"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const render_1 = require("@react-email/render");
const PurchaseReceipt_1 = require("../mail/templates/PurchaseReceipt");
const mail_service_1 = require("../mail/mail.service");
const React = __importStar(require("react"));
let EmailProcessor = EmailProcessor_1 = class EmailProcessor extends bullmq_1.WorkerHost {
    configService;
    mailService;
    logger = new common_1.Logger(EmailProcessor_1.name);
    client = null;
    defaultFrom;
    constructor(configService, mailService) {
        super();
        this.configService = configService;
        this.mailService = mailService;
        this.logger.log('EmailProcessor: Instantiated and ready');
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
            if (template === 'purchase-receipt') {
                this.logger.log(`Using MailService for rich purchase receipt: ${to}`);
                await this.mailService.sendPurchaseReceipt(to, data?.orderId || 'UNKNOWN', data?.total || 0, data?.items || []);
                return;
            }
            this.logger.log(`Starting template rendering for ${template || 'no-template'}...`);
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
            }
            else {
                this.logger.log(`Applying fallback delivery (MailService) for ${to}`);
                await this.mailService.sendGenericEmail(to, subject, emailHtml);
                this.logger.log(`Email sent via MailService fallback to ${to}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
    }
    async renderTemplate(template, data) {
        if (template === 'purchase-receipt') {
            return await (0, render_1.render)(React.createElement(PurchaseReceipt_1.PurchaseReceipt, {
                orderId: data.orderId,
                total: data.total,
                items: data.items
            }));
        }
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
    __metadata("design:paramtypes", [config_1.ConfigService,
        mail_service_1.MailService])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map