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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let QueueService = QueueService_1 = class QueueService {
    emailQueue;
    logger = new common_1.Logger(QueueService_1.name);
    constructor(emailQueue) {
        this.emailQueue = emailQueue;
    }
    async sendEmail(data, priority = 0) {
        await this.emailQueue.add('send', data, {
            priority,
            delay: 0,
        });
        this.logger.log(`Email job queued for: ${data.to}`);
    }
    async sendWelcomeEmail(email, name) {
        await this.sendEmail({
            to: email,
            subject: 'Welcome to Our Store!',
            html: '',
            template: 'welcome',
            data: { name },
        });
    }
    async sendOrderConfirmation(email, orderId, total, name) {
        await this.sendEmail({
            to: email,
            subject: `Order Confirmed - #${orderId}`,
            html: '',
            template: 'order-confirmation',
            data: { orderId, total, name },
        }, 1);
    }
    async sendPasswordResetEmail(email, resetUrl) {
        await this.sendEmail({
            to: email,
            subject: 'Reset Your Password',
            html: '',
            template: 'password-reset',
            data: { resetUrl },
        }, 2);
    }
    async sendVerificationEmail(email, verifyUrl) {
        await this.sendEmail({
            to: email,
            subject: 'Verify Your Email',
            html: '',
            template: 'verification',
            data: { verifyUrl },
        });
    }
    async getQueueStats() {
        const [waiting, active, completed, failed] = await Promise.all([
            this.emailQueue.getWaitingCount(),
            this.emailQueue.getActiveCount(),
            this.emailQueue.getCompletedCount(),
            this.emailQueue.getFailedCount(),
        ]);
        return { waiting, active, completed, failed };
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('email')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], QueueService);
//# sourceMappingURL=queue.service.js.map