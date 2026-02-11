import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';
import { CartService } from '../cart/cart.service';
import { MailService } from '../mail/mail.service';
export declare class StripeService {
    private configService;
    private ordersService;
    private cartService;
    private mailService;
    private stripe;
    private logger;
    constructor(configService: ConfigService, ordersService: OrdersService, cartService: CartService, mailService: MailService);
    createPaymentIntent(amount: number, currency?: string, metadata?: any): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    updatePaymentIntent(paymentIntentId: string, metadata: any): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    handleWebhook(signature: string, rawBody: Buffer): Promise<{
        received: boolean;
    }>;
    private handlePaymentSuccess;
}
