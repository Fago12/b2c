import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private ensureShippingConfig;
    private ensureStoreSettings;
    getShippingConfig(): Promise<{
        id: string;
        updatedAt: Date;
        usFlatRateInCents: number;
        nigeriaFlatRateInCents: number;
        indiaFlatRateInCents: number;
        ghanaFlatRateInCents: number;
        chinaFlatRateInCents: number;
        internationalFlatRateInCents: number;
    } | null>;
    updateShippingConfig(data: {
        usFlatRateInCents?: number;
        nigeriaFlatRateInCents?: number;
        indiaFlatRateInCents?: number;
        ghanaFlatRateInCents?: number;
        chinaFlatRateInCents?: number;
        internationalFlatRateInCents?: number;
    }): Promise<{
        id: string;
        updatedAt: Date;
        usFlatRateInCents: number;
        nigeriaFlatRateInCents: number;
        indiaFlatRateInCents: number;
        ghanaFlatRateInCents: number;
        chinaFlatRateInCents: number;
        internationalFlatRateInCents: number;
    }>;
    getStoreSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        storeName: string;
        currency: string;
        supportEmail: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    updateStoreSettings(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        storeName: string;
        currency: string;
        supportEmail: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
