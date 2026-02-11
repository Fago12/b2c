import { StripeService } from './stripe.service';
export declare class PaymentController {
    private stripeService;
    private logger;
    constructor(stripeService: StripeService);
    createPaymentIntent(body: {
        amount: number;
        metadata?: any;
    }): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>>;
    updatePaymentIntent(body: {
        paymentIntentId: string;
        metadata: any;
    }): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>>;
}
