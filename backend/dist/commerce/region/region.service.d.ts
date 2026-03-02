import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export declare class RegionService implements OnModuleInit {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private ensureDefaultRegions;
    getRegion(code: string): Promise<{
        symbol: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        currency: string;
        code: string;
        isDefault: boolean;
    } | null>;
    getDefaultRegion(): Promise<{
        symbol: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        currency: string;
        code: string;
        isDefault: boolean;
    } | null>;
    getAllActiveRegions(): Promise<{
        symbol: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        currency: string;
        code: string;
        isDefault: boolean;
    }[]>;
}
