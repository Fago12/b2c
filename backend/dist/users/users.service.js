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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        console.log('UsersService.create called with:', data.email);
        try {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(data.password || '', salt);
            const { email, role, avatar, verificationToken } = data;
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role,
                    avatar,
                    verificationToken,
                    isVerified: false,
                },
            });
            console.log('UsersService.create success:', user.id);
            return user;
        }
        catch (error) {
            console.error('UsersService.create error:', error);
            throw error;
        }
    }
    async verifyUser(id) {
        return this.prisma.user.update({
            where: { id },
            data: { isVerified: true, verificationToken: null },
        });
    }
    async findOne(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async setResetToken(email, token, expires) {
        return this.prisma.user.update({
            where: { email },
            data: { resetToken: token, resetTokenExpires: expires },
        });
    }
    async updatePassword(id, password) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword, resetToken: null, resetTokenExpires: null },
        });
        await this.prisma.account.updateMany({
            where: { userId: id, providerId: 'credential' },
            data: { password: hashedPassword },
        });
        return updatedUser;
    }
    async findAllAdmin(params) {
        const { search, role, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.email = { contains: search, mode: 'insensitive' };
        }
        if (role) {
            where.role = role;
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                    _count: { select: { orders: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                isVerified: true,
                createdAt: true,
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { items: true },
                },
            },
        });
    }
    async updateRole(id, role) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, role: true },
        });
    }
    async getTeamMembers() {
        return this.prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                createdAt: true,
                image: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCustomerStats() {
        const [total, admins, customers, verified, unverified] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.user.count({ where: { isVerified: true } }),
            this.prisma.user.count({ where: { isVerified: false } }),
        ]);
        return { total, admins, customers, verified, unverified };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map