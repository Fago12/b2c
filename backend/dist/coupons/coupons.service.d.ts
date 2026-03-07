import { PrismaService } from '../prisma/prisma.service';
import { DiscountType } from '@prisma/client';
export declare class CouponsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        isActive?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        coupons: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            code: string;
            discountType: import(".prisma/client").$Enums.DiscountType;
            value: number;
            minOrderAmount: number | null;
            maxUses: number | null;
            usedCount: number;
            expiresAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
        expiresAt: Date | null;
    } | null>;
    findByCode(code: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
        expiresAt: Date | null;
    } | null>;
    create(data: {
        code: string;
        discountType: DiscountType;
        value: number;
        minOrderAmount?: number;
        maxUses?: number;
        expiresAt?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
        expiresAt: Date | null;
    }>;
    update(id: string, data: {
        code?: string;
        discountType?: DiscountType;
        value?: number;
        minOrderAmount?: number;
        maxUses?: number;
        expiresAt?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
        expiresAt: Date | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
        expiresAt: Date | null;
    }>;
    validateCoupon(code: string, orderTotal: number): Promise<{
        valid: boolean;
        error: string;
        coupon?: undefined;
        discount?: undefined;
        finalTotal?: undefined;
    } | {
        valid: boolean;
        coupon: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            code: string;
            discountType: import(".prisma/client").$Enums.DiscountType;
            value: number;
            minOrderAmount: number | null;
            maxUses: number | null;
            usedCount: number;
            expiresAt: Date | null;
        };
        discount: number;
        finalTotal: number;
        error?: undefined;
    }>;
    incrementUsage(id: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
        expiresAt: Date | null;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        expired: number;
        totalUsage: number;
    }>;
}
