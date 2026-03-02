import { PrismaService } from '../prisma/prisma.service';
interface CustomizationChoices {
    embroidery?: {
        enabled: boolean;
        text?: string;
    };
    customColor?: string;
    instructions?: string;
}
export declare class PricingService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateProductPrice(productId: string, customization?: CustomizationChoices): Promise<number>;
    calculateTotal(items: {
        productId: string;
        quantity: number;
        customization?: CustomizationChoices;
    }[]): Promise<number>;
}
export {};
