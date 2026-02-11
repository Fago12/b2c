import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class AdminHomepageController {
    private prisma;
    private cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    getSections(): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.SectionType;
        referenceId: string | null;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createSection(data: any): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.SectionType;
        referenceId: string | null;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reorderSections(items: {
        id: string;
        order: number;
    }[]): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.SectionType;
        referenceId: string | null;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateSection(id: string, data: any): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.SectionType;
        referenceId: string | null;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteSection(id: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.SectionType;
        referenceId: string | null;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAnnouncements(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        ctaText: string | null;
        ctaLink: string | null;
        startAt: Date | null;
        endAt: Date | null;
        backgroundColor: string;
        textColor: string;
        priority: number;
    }[]>;
    createAnnouncement(data: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        ctaText: string | null;
        ctaLink: string | null;
        startAt: Date | null;
        endAt: Date | null;
        backgroundColor: string;
        textColor: string;
        priority: number;
    }>;
    updateAnnouncement(id: string, data: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        ctaText: string | null;
        ctaLink: string | null;
        startAt: Date | null;
        endAt: Date | null;
        backgroundColor: string;
        textColor: string;
        priority: number;
    }>;
    deleteAnnouncement(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        ctaText: string | null;
        ctaLink: string | null;
        startAt: Date | null;
        endAt: Date | null;
        backgroundColor: string;
        textColor: string;
        priority: number;
    }>;
    getHeroes(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        ctaText: string;
        ctaLink: string;
        title: string;
        subtitle: string | null;
        imageUrl: string;
    }[]>;
    createHero(file: Express.Multer.File, body: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        ctaText: string;
        ctaLink: string;
        title: string;
        subtitle: string | null;
        imageUrl: string;
    }>;
    updateHero(id: string, file: Express.Multer.File, body: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        ctaText: string;
        ctaLink: string;
        title: string;
        subtitle: string | null;
        imageUrl: string;
    }>;
    getMarqueeItems(): Promise<{
        id: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        text: string;
    }[]>;
    createMarqueeItem(data: any): Promise<{
        id: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        text: string;
    }>;
    updateMarqueeItem(id: string, data: any): Promise<{
        id: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        text: string;
    }>;
    deleteMarqueeItem(id: string): Promise<{
        id: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        text: string;
    }>;
    getFeaturedCollections(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        productIds: string[];
    }[]>;
    createFeaturedCollection(data: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        productIds: string[];
    }>;
    updateFeaturedCollection(id: string, data: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        productIds: string[];
    }>;
    deleteFeaturedCollection(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        productIds: string[];
    }>;
    getPromos(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        ctaText: string;
        ctaLink: string;
        title: string;
        subtitle: string | null;
        imageUrl: string;
        targetAudience: string;
    }[]>;
    createPromo(file: Express.Multer.File, body: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        ctaText: string;
        ctaLink: string;
        title: string;
        subtitle: string | null;
        imageUrl: string;
        targetAudience: string;
    }>;
    updatePromo(id: string, file: Express.Multer.File, body: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        ctaText: string;
        ctaLink: string;
        title: string;
        subtitle: string | null;
        imageUrl: string;
        targetAudience: string;
    }>;
    deletePromo(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        ctaText: string;
        ctaLink: string;
        title: string;
        subtitle: string | null;
        imageUrl: string;
        targetAudience: string;
    }>;
}
