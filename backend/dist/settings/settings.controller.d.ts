import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        storeName: string;
        currency: string;
        supportEmail: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    updateSettings(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        storeName: string;
        currency: string;
        supportEmail: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
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
}
