import { HomepageService } from './homepage.service';
export declare class HomepageController {
    private readonly homepageService;
    constructor(homepageService: HomepageService);
    getHomepage(): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.SectionType;
        order: number;
        data: any;
    }[]>;
}
