import { HomepageService } from './homepage.service';
export declare class HomepageController {
    private readonly homepageService;
    constructor(homepageService: HomepageService);
    getHomepage(req: any): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.SectionType;
        order: number;
        data: any;
    }[]>;
    getAnnouncement(): Promise<{
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
