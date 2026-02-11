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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const mail_service_1 = require("../mail/mail.service");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
let AdminService = AdminService_1 = class AdminService {
    usersService;
    mailService;
    prisma;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(usersService, mailService, prisma) {
        this.usersService = usersService;
        this.mailService = mailService;
        this.prisma = prisma;
    }
    async getTeam() {
        return this.usersService.getTeamMembers();
    }
    async inviteAdmin(email, inviterName) {
        this.logger.log(`Inviting admin: ${email}`);
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            if (existingUser.resetToken) {
                this.logger.log(`Re-inviting pending admin: ${email}`);
                const resetToken = crypto.randomBytes(32).toString('hex');
                const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
                await this.prisma.user.update({
                    where: { email },
                    data: { resetToken, resetTokenExpires },
                });
                const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/setup?token=${resetToken}`;
                try {
                    await this.mailService.sendAdminInvite(email, inviteLink, inviterName);
                }
                catch (e) {
                    this.logger.error(`Failed to send invite email: ${e.message}`);
                }
                return { message: 'Invitation re-sent successfully' };
            }
            throw new common_1.ConflictException('User with this email already exists and is active');
        }
        const temporaryPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const newUser = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'ADMIN',
                isVerified: true,
                emailVerified: true,
                resetToken,
                resetTokenExpires,
                name: 'Admin User',
            },
        });
        await this.prisma.account.create({
            data: {
                userId: newUser.id,
                providerId: 'credential',
                accountId: email,
                password: hashedPassword,
            }
        });
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/setup?token=${resetToken}`;
        try {
            await this.mailService.sendAdminInvite(email, inviteLink, inviterName);
        }
        catch (e) {
            this.logger.error(`Failed to send invite email: ${e.message}`);
        }
        return { message: 'Invitation sent successfully' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        mail_service_1.MailService,
        prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map