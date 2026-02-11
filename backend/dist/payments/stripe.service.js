"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const orders_service_1 = require("../orders/orders.service");
const cart_service_1 = require("../cart/cart.service");
const mail_service_1 = require("../mail/mail.service");
let StripeService = StripeService_1 = class StripeService {
    configService;
    ordersService;
    cartService;
    mailService;
    stripe;
    logger = new common_1.Logger(StripeService_1.name);
    constructor(configService, ordersService, cartService, mailService) {
        this.configService = configService;
        this.ordersService = ordersService;
        this.cartService = cartService;
        this.mailService = mailService;
        const apiKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!apiKey) {
            this.logger.error('STRIPE_SECRET_KEY not found in environment variables');
            this.stripe = new stripe_1.default('dummy_key', { apiVersion: '2026-01-28.clover' });
        }
        else {
            this.stripe = new stripe_1.default(apiKey, {
                apiVersion: '2026-01-28.clover',
            });
        }
    }
    async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount),
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Error creating payment intent: ${error.message}`);
            throw error;
        }
    }
    async updatePaymentIntent(paymentIntentId, metadata) {
        try {
            return await this.stripe.paymentIntents.update(paymentIntentId, { metadata });
        }
        catch (error) {
            this.logger.error(`Error updating payment intent: ${error.message}`);
            throw error;
        }
    }
    async handleWebhook(signature, rawBody) {
        this.logger.log('Webhook received');
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            this.logger.error('Error: STRIPE_WEBHOOK_SECRET not configured');
            throw new Error('Webhook secret not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
            this.logger.log(`Webhook parsed: ${event.type}`);
        }
        catch (err) {
            this.logger.error(`Signature verification failed: ${err.message}`);
            throw new Error(`Webhook Error: ${err.message}`);
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            this.logger.log(`Session Metadata: ${JSON.stringify(session.metadata)}`);
            await this.handlePaymentSuccess(session.metadata);
        }
        else if (event.type === 'payment_intent.succeeded') {
            const paymentIntentObj = event.data.object;
            this.logger.log(`Webhook PI ID: ${paymentIntentObj.id}`);
            this.logger.debug(`Initial Metadata: ${JSON.stringify(paymentIntentObj.metadata)}`);
            let metadata = paymentIntentObj.metadata;
            if (!metadata || Object.keys(metadata).length === 0) {
                this.logger.warn(`Metadata empty, fetching fresh PaymentIntent...`);
                try {
                    const freshPi = await this.stripe.paymentIntents.retrieve(paymentIntentObj.id);
                    this.logger.log(`Fresh Metadata: ${JSON.stringify(freshPi.metadata)}`);
                    metadata = freshPi.metadata;
                }
                catch (e) {
                    this.logger.error(`Failed to fetch fresh PI: ${e.message}`);
                }
            }
            await this.handlePaymentSuccess(metadata);
        }
        return { received: true };
    }
    async handlePaymentSuccess(metadata) {
        const orderId = metadata?.orderId;
        const userId = metadata?.userId;
        if (!orderId) {
            this.logger.error('Error: No orderId in metadata');
            return;
        }
        this.logger.log(`Processing Order: ${orderId}`);
        try {
            const order = await this.ordersService.updateStatus(orderId, 'PAID');
            this.logger.log(`Order updated to PAID: ${order.id}`);
            const sessionId = metadata?.sessionId;
            if (sessionId) {
                await this.cartService.clearCart(sessionId);
                this.logger.log(`Cleared cart for session ${sessionId}`);
            }
            if (order.email) {
                this.logger.log(`Sending email to ${order.email}`);
                await this.mailService.sendPurchaseReceipt(order.email, order.id, order.total, order.items.map((item) => ({
                    name: item.product?.name || 'Product',
                    quantity: item.quantity,
                    price: item.price
                })));
                this.logger.log('Email sent successfully');
            }
        }
        catch (e) {
            this.logger.error(`Error processing order ${orderId}: ${e.message}`);
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        orders_service_1.OrdersService,
        cart_service_1.CartService,
        mail_service_1.MailService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map