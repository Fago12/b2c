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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const resend_service_1 = require("../mail/resend.service");
const prisma_service_1 = require("../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    resendService;
    prisma;
    ordersService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService, resendService, prisma, ordersService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.resendService = resendService;
        this.prisma = prisma;
        this.ordersService = ordersService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password || ''))) {
            if (!user.isVerified) {
                throw new common_1.UnauthorizedException('Email not verified. Please verify your email.');
            }
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const tokens = await this.getTokens(user.id, user.email, user.role || 'user');
        await this.storeRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }
    async getTokens(userId, email, role) {
        const payload = { email, sub: userId, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            this.jwtService.signAsync(payload, { expiresIn: '7d' }),
        ]);
        return { access_token: accessToken, refresh_token: refreshToken };
    }
    async storeRefreshToken(userId, refreshToken) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken: hash },
        });
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.hashedRefreshToken)
            throw new common_1.UnauthorizedException('Access Denied');
        const rtMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!rtMatches)
            throw new common_1.UnauthorizedException('Access Denied');
        const tokens = await this.getTokens(user.id, user.email, user.role || 'user');
        await this.storeRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }
    async logout(userId) {
        await this.prisma.user.update({ where: { id: userId }, data: { hashedRefreshToken: null } });
    }
    async register(user) {
        this.logger.log(`AuthService.register called for: ${user.email}`);
        try {
            const existingUser = await this.usersService.findOne(user.email);
            if (existingUser) {
                this.logger.warn('AuthService.register: User already exists');
                throw new common_1.ConflictException('User with this email already exists');
            }
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.logger.log('AuthService.register: Creating user...');
            const newUser = await this.usersService.create({ ...user, verificationToken: token });
            this.logger.log('AuthService.register: Attaching guest orders...');
            await this.ordersService.attachGuestOrders(newUser.email, newUser.id);
            this.logger.log('AuthService.register: Sending verification email...');
            try {
                await this.resendService.sendVerificationEmail(newUser.email, token);
                this.logger.log('AuthService.register: Email sent');
            }
            catch (error) {
                this.logger.error(`Failed to send verification email: ${error}`);
            }
            return { message: 'Registration successful. Please check your email to verify your account.' };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException)
                throw error;
            this.logger.error(`AuthService.register CRITICAL ERROR: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            this.logger.error(`Stack Trace: ${error instanceof Error ? error.stack : ''}`);
            throw new Error(`Registration failed: ${error.message}`);
        }
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({ where: { verificationToken: token } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid verification token');
        }
        await this.usersService.verifyUser(user.id);
        return { message: 'Email verified successfully. You can now login.' };
    }
    async forgotPassword(email) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            return { message: 'If this email exists, a reset link has been sent.' };
        }
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        await this.usersService.setResetToken(email, token, expires);
        const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
        await this.resendService.sendPasswordReset(email, resetLink);
        return { message: 'If this email exists, a reset link has been sent.' };
    }
    async resetPassword(token, newPass) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: { gt: new Date() },
            }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        await this.usersService.updatePassword(user.id, newPass);
        return { message: 'Password reset successfully. You can now login.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        resend_service_1.ResendService,
        prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map