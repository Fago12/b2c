import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, DiscountType } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { isActive, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CouponWhereInput = {};
    
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

  async findOne(id: string) {
    return this.prisma.coupon.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  }

  async create(data: {
    code: string;
    discountType: DiscountType;
    value: number;
    minOrderAmount?: number;
    maxUses?: number;
    expiresAt?: string;
    isActive?: boolean;
  }) {
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

  async update(id: string, data: {
    code?: string;
    discountType?: DiscountType;
    value?: number;
    minOrderAmount?: number;
    maxUses?: number;
    expiresAt?: string;
    isActive?: boolean;
  }) {
    const updateData: any = { ...data };
    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    
    return this.prisma.coupon.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }

  async validateCoupon(code: string, orderTotal: number) {
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
    } else {
      discount = coupon.value;
    }

    return {
      valid: true,
      coupon,
      discount,
      finalTotal: orderTotal - discount,
    };
  }

  async incrementUsage(id: string) {
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
}
