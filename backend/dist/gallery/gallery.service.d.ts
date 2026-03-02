import { PrismaService } from '../prisma/prisma.service';
import { GalleryItemType } from '@prisma/client';
export declare class GalleryService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tag?: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.GalleryItemType;
        isActive: boolean;
        displayOrder: number;
        url: string;
        tag: string | null;
    }[]>;
    create(data: {
        type: GalleryItemType;
        url: string;
        tag?: string;
        displayOrder?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.GalleryItemType;
        isActive: boolean;
        displayOrder: number;
        url: string;
        tag: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.GalleryItemType;
        isActive: boolean;
        displayOrder: number;
        url: string;
        tag: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.GalleryItemType;
        isActive: boolean;
        displayOrder: number;
        url: string;
        tag: string | null;
    }>;
}
