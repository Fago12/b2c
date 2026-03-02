import { RegionService } from './region.service';
export declare class RegionController {
    private readonly regionService;
    constructor(regionService: RegionService);
    getRegions(): Promise<{
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
