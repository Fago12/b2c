import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class AdminHomepageController {
    private prisma;
    private cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    getSections(): Promise<{
        title: string;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.SectionType;
        isActive: boolean;
        referenceId: string | null;
    }[]>;
    createSection(data: any): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.SectionType;
        isActive: boolean;
        referenceId: string | null;
    }>;
    reorderSections(items: {
        id: string;
        order: number;
    }[]): Promise<{
        success: boolean;
    }>;
    updateSection(id: string, data: any): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.SectionType;
        isActive: boolean;
        referenceId: string | null;
    }>;
    deleteSection(id: string): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.SectionType;
        isActive: boolean;
        referenceId: string | null;
    }>;
    getAnnouncements(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isActive: boolean;
        priority: number;
        ctaText: string | null;
        ctaLink: string | null;
        startAt: Date | null;
        endAt: Date | null;
        backgroundColor: string;
        textColor: string;
    }[]>;
    createAnnouncement(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isActive: boolean;
        priority: number;
        ctaText: string | null;
        ctaLink: string | null;
        startAt: Date | null;
        endAt: Date | null;
        backgroundColor: string;
        textColor: string;
    }>;
    updateAnnouncement(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isActive: boolean;
        priority: number;
        ctaText: string | null;
        ctaLink: string | null;
        startAt: Date | null;
        endAt: Date | null;
        backgroundColor: string;
        textColor: string;
    }>;
    deleteAnnouncement(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isActive: boolean;
        priority: number;
        ctaText: string | null;
        ctaLink: string | null;
        startAt: Date | null;
        endAt: Date | null;
        backgroundColor: string;
        textColor: string;
    }>;
    getHeroes(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
        title: string;
        videoUrl: string | null;
        mediaType: string;
    }[]>;
    createHero(file: Express.Multer.File, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
        title: string;
        videoUrl: string | null;
        mediaType: string;
    }>;
    updateHero(id: string, file: Express.Multer.File, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
        title: string;
        videoUrl: string | null;
        mediaType: string;
    }>;
    getMarqueeItems(): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        isActive: boolean;
        icon: string | null;
    }[]>;
    createMarqueeItem(data: any): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        isActive: boolean;
        icon: string | null;
    }>;
    updateMarqueeItem(id: string, data: any): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        isActive: boolean;
        icon: string | null;
    }>;
    deleteMarqueeItem(id: string): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        isActive: boolean;
        icon: string | null;
    }>;
    getFeaturedCollections(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        title: string;
        productIds: string[];
    }[]>;
    createFeaturedCollection(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        title: string;
        productIds: string[];
    }>;
    updateFeaturedCollection(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        title: string;
        productIds: string[];
    }>;
    deleteFeaturedCollection(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        title: string;
        productIds: string[];
    }>;
    getPromos(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string;
        title: string;
        ctaText: string;
        ctaLink: string;
        subtitle: string | null;
        targetAudience: string;
    }[]>;
    createPromo(file: Express.Multer.File, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string;
        title: string;
        ctaText: string;
        ctaLink: string;
        subtitle: string | null;
        targetAudience: string;
    }>;
    updatePromo(id: string, file: Express.Multer.File, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string;
        title: string;
        ctaText: string;
        ctaLink: string;
        subtitle: string | null;
        targetAudience: string;
    }>;
    deletePromo(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string;
        title: string;
        ctaText: string;
        ctaLink: string;
        subtitle: string | null;
        targetAudience: string;
    }>;
}
