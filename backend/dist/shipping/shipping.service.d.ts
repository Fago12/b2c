import { PrismaService } from '../prisma/prisma.service';
export declare class ShippingService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateShippingCost(country: string, state?: string): Promise<number>;
    private getDefaultUSRate;
}
