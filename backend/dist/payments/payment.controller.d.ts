import { StripeService } from './stripe.service';
import { CartService } from '../cart/cart.service';
import type { Request } from 'express';
export declare class PaymentController {
    private stripeService;
    private cartService;
    private logger;
    constructor(stripeService: StripeService, cartService: CartService);
    private getSessionId;
    createPaymentIntent(req: Request, body: {
        sessionId?: string;
        metadata?: any;
    }): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>>;
    updatePaymentIntent(body: {
        paymentIntentId: string;
        metadata: any;
    }): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>>;
}
