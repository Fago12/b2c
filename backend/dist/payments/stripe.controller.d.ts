import { StripeService } from './stripe.service';
import type { Request } from 'express';
export declare class StripeController {
    private readonly stripeService;
    constructor(stripeService: StripeService);
    handleStripeWebhook(signature: string, request: Request): Promise<{
        received: boolean;
    }>;
}
