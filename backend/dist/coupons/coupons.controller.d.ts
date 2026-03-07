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
    findAll(isActive?: string, page?: string, limit?: string): Promise<{
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
    getStats(): Promise<{
        total: number;
        active: number;
        expired: number;
        totalUsage: number;
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
}
