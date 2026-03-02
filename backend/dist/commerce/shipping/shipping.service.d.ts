import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../../settings/settings.service';
export declare class ShippingService {
    private prisma;
    private settingsService;
    private readonly logger;
    constructor(prisma: PrismaService, settingsService: SettingsService);
    calculateShipping(countryCode: string, totalWeightKg?: number): Promise<number>;
}
