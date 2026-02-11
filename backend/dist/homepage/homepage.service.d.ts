import { PrismaService } from '../prisma/prisma.service';
export declare class HomepageService {
    private prisma;
    constructor(prisma: PrismaService);
    getHomepageContent(): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.SectionType;
        order: number;
        data: any;
    }[]>;
    private hydrateSectionData;
}
