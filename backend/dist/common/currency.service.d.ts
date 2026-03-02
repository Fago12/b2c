import { PrismaService } from '../prisma/prisma.service';
export declare class CurrencyService {
    private prisma;
    constructor(prisma: PrismaService);
    convertFromUSD(amountInUSD: number, targetCurrency: string): Promise<number>;
    getRates(): Promise<any>;
    formatPrice(amount: number, currency: string): string;
}
