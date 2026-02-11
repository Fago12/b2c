import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
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
