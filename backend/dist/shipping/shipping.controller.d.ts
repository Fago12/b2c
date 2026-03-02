import { ShippingService } from './shipping.service';
export declare class ShippingController {
    private readonly shippingService;
    constructor(shippingService: ShippingService);
    calculateShipping(body: {
        country: string;
        state?: string;
    }): Promise<{
        cost: number;
    }>;
}
