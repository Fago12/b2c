import { CouponsService } from './coupons.service';
import { DiscountType } from '@prisma/client';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validateCoupon(data: {
        code: string;
        orderTotal: number;
    }): Promise<{
        valid: boolean;
        error: string;
        coupon?: undefined;
        discount?: undefined;
        finalTotal?: undefined;
    } | {
        valid: boolean;
        coupon: {
            id: string;
            expiresAt: Date | null;
            createdAt: Date;
            isActive: boolean;
            code: string;
            discountType: import(".prisma/client").$Enums.DiscountType;
            value: number;
            minOrderAmount: number | null;
            maxUses: number | null;
            usedCount: number;
        };
        discount: number;
        finalTotal: number;
        error?: undefined;
    }>;
    findAll(isActive?: string, page?: string, limit?: string): Promise<{
        coupons: {
            id: string;
            expiresAt: Date | null;
            createdAt: Date;
            isActive: boolean;
            code: string;
            discountType: import(".prisma/client").$Enums.DiscountType;
            value: number;
            minOrderAmount: number | null;
            maxUses: number | null;
            usedCount: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        expired: number;
        totalUsage: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        expiresAt: Date | null;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
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
        expiresAt: Date | null;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
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
        expiresAt: Date | null;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
    }>;
    delete(id: string): Promise<{
        id: string;
        expiresAt: Date | null;
        createdAt: Date;
        isActive: boolean;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
    }>;
}
