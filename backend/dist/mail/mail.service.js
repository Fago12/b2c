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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const render_1 = require("@react-email/render");
const WelcomeEmail_1 = require("./templates/WelcomeEmail");
const PurchaseReceipt_1 = require("./templates/PurchaseReceipt");
const AdminInviteEmail_1 = require("./templates/AdminInviteEmail");
let MailService = class MailService {
    transporter;
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
        }
        else {
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
    async sendVerificationEmail(email, token) {
        if (!this.transporter)
            await this.createTransporter();
        const verificationUrl = `http://localhost:3000/verify?token=${token}`;
        const info = await this.transporter.sendMail({
            from: '"Woven Kulture" <noreply@wovenkulture.com>',
            to: email,
            subject: 'Verify your email address',
            text: `Welcome! Please verify your email by clicking here: ${verificationUrl}`,
            html: `<b>Welcome!</b><br>Please verify your email by clicking <a href="${verificationUrl}">here</a>.`,
        });
        console.log('Verification Email sent: %s', info.messageId);
        if (!process.env.SMTP_HOST)
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return info;
    }
    async sendPasswordResetEmail(email, token) {
        if (!this.transporter)
            await this.createTransporter();
        const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;
        const info = await this.transporter.sendMail({
            from: '"Woven Kulture" <noreply@wovenkulture.com>',
            to: email,
            subject: 'Reset your password',
            text: `Reset your password by clicking here: ${resetUrl}`,
            html: `<b>Reset Password</b><br>Click <a href="${resetUrl}">here</a> to reset your password.`,
        });
        console.log('Password Reset Email sent: %s', info.messageId);
        if (!process.env.SMTP_HOST)
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return info;
    }
    async sendWelcomeEmail(email, firstName) {
        if (!this.transporter)
            await this.createTransporter();
        const emailHtml = await (0, render_1.render)((0, WelcomeEmail_1.WelcomeEmail)({ firstName }));
        const info = await this.transporter.sendMail({
            from: '"Woven Kulture" <noreply@wovenkulture.com>',
            to: email,
            subject: 'Welcome to Woven Kulture!',
            html: emailHtml,
        });
        console.log('Welcome Email sent: %s', info.messageId);
        if (!process.env.SMTP_HOST)
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return info;
    }
    async sendPurchaseReceipt(email, orderId, total, items) {
        if (!this.transporter)
            await this.createTransporter();
        const emailHtml = await (0, render_1.render)((0, PurchaseReceipt_1.PurchaseReceipt)({ orderId, total, items }));
        const info = await this.transporter.sendMail({
            from: '"Woven Kulture" <noreply@wovenkulture.com>',
            to: email,
            subject: `Order Receipt: ${orderId}`,
            html: emailHtml,
        });
        console.log('Purchase Receipt sent: %s', info.messageId);
        if (!process.env.SMTP_HOST)
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return info;
    }
    async sendAdminInvite(email, inviteUrl, inviterName) {
        if (!this.transporter)
            await this.createTransporter();
        const emailHtml = await (0, render_1.render)((0, AdminInviteEmail_1.AdminInviteEmail)({ inviteUrl, inviterName }));
        const info = await this.transporter.sendMail({
            from: '"Woven Kulture" <noreply@wovenkulture.com>',
            to: email,
            subject: 'You have been invited to join Woven Kulture Admin',
            html: emailHtml,
        });
        console.log('Admin Invite sent: %s', info.messageId);
        if (!process.env.SMTP_HOST)
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return info;
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map