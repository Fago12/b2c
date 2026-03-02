import { CurrencyService } from './currency.service';
export declare class CurrencyController {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    getRates(): Promise<any>;
    convert(amount: string, to: string): Promise<{
        amount: number;
    }>;
}
