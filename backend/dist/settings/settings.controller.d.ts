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
    }>;
    updateSettings(data: {
        storeName?: string;
        description?: string;
        currency?: string;
        supportEmail?: string;
        socialLinks?: any;
    }): Promise<{
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
