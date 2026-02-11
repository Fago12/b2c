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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CouponsService = class CouponsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { isActive, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [coupons, total] = await Promise.all([
            this.prisma.coupon.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.coupon.count({ where }),
        ]);
        return {
            coupons,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        return this.prisma.coupon.findUnique({ where: { id } });
    }
    async findByCode(code) {
        return this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    }
    async create(data) {
        return this.prisma.coupon.create({
            data: {
                code: data.code.toUpperCase(),
                discountType: data.discountType,
                value: data.value,
                minOrderAmount: data.minOrderAmount,
                maxUses: data.maxUses,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                isActive: data.isActive ?? true,
            },
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.code)
            updateData.code = data.code.toUpperCase();
        if (data.expiresAt)
            updateData.expiresAt = new Date(data.expiresAt);
        return this.prisma.coupon.update({
            where: { id },
            data: updateData,
        });
    }
    async delete(id) {
        return this.prisma.coupon.delete({ where: { id } });
    }
    async validateCoupon(code, orderTotal) {
        const coupon = await this.findByCode(code);
        if (!coupon) {
            return { valid: false, error: 'Coupon not found' };
        }
        if (!coupon.isActive) {
            return { valid: false, error: 'Coupon is inactive' };
        }
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return { valid: false, error: 'Coupon has expired' };
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return { valid: false, error: 'Coupon usage limit reached' };
        }
        if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
            return { valid: false, error: `Minimum order of ₦${coupon.minOrderAmount} required` };
        }
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.round(orderTotal * (coupon.value / 100));
        }
        else {
            discount = coupon.value;
        }
        return {
            valid: true,
            coupon,
            discount,
            finalTotal: orderTotal - discount,
        };
    }
    async incrementUsage(id) {
        return this.prisma.coupon.update({
            where: { id },
            data: { usedCount: { increment: 1 } },
        });
    }
    async getStats() {
        const [total, active, expired, totalUsage] = await Promise.all([
            this.prisma.coupon.count(),
            this.prisma.coupon.count({ where: { isActive: true } }),
            this.prisma.coupon.count({
                where: {
                    expiresAt: { lt: new Date() }
                }
            }),
            this.prisma.coupon.aggregate({ _sum: { usedCount: true } }),
        ]);
        return {
            total,
            active,
            expired,
            totalUsage: totalUsage._sum.usedCount || 0,
        };
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map