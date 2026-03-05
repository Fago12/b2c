import { PrismaService } from '../prisma/prisma.service';
import { CommercePricingService } from '../commerce/pricing/pricing.service';
export declare class HomepageService {
    private prisma;
    private pricingService;
    constructor(prisma: PrismaService, pricingService: CommercePricingService);
    private readonly productInclude;
    getHomepageContent(regionCode?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.SectionType;
        order: number;
        data: any;
    }[]>;
    private hydrateSectionData;
    getActiveAnnouncement(): Promise<{
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
    } | null>;
}
