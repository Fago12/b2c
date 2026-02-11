import { Injectable, Logger, RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';
import { CartService } from '../cart/cart.service';
import { MailService } from '../mail/mail.service';
import { Request } from 'express';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private cartService: CartService,
    private mailService: MailService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!apiKey) {
      this.logger.error('STRIPE_SECRET_KEY not found in environment variables');
      this.stripe = new Stripe('dummy_key', { apiVersion: '2026-01-28.clover' });
    } else {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2026-01-28.clover',
      });
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount), // Stripe expects integers (cents)
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error creating payment intent: ${error.message}`);
      throw error;
    }
  }

  async updatePaymentIntent(paymentIntentId: string, metadata: any) {
    try {
      return await this.stripe.paymentIntents.update(paymentIntentId, { metadata });
    } catch (error) {
       this.logger.error(`Error updating payment intent: ${error.message}`);
       throw error;
    }
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    this.logger.log('Webhook received');
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.error('Error: STRIPE_WEBHOOK_SECRET not configured');
      throw new Error('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      this.logger.log(`Webhook parsed: ${event.type}`);
    } catch (err) {
      this.logger.error(`Signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      this.logger.log(`Session Metadata: ${JSON.stringify(session.metadata)}`);
      await this.handlePaymentSuccess(session.metadata);
    } else if (event.type === 'payment_intent.succeeded') {
      const paymentIntentObj = event.data.object as Stripe.PaymentIntent;
      this.logger.log(`Webhook PI ID: ${paymentIntentObj.id}`);
      this.logger.debug(`Initial Metadata: ${JSON.stringify(paymentIntentObj.metadata)}`);
      
      let metadata = paymentIntentObj.metadata;
      
      // If metadata is empty, try fetching fresh from Stripe
      if (!metadata || Object.keys(metadata).length === 0) {
          this.logger.warn(`Metadata empty, fetching fresh PaymentIntent...`);
          try {
              const freshPi = await this.stripe.paymentIntents.retrieve(paymentIntentObj.id);
              this.logger.log(`Fresh Metadata: ${JSON.stringify(freshPi.metadata)}`);
              metadata = freshPi.metadata;
          } catch (e) {
              this.logger.error(`Failed to fetch fresh PI: ${e.message}`);
          }
      }
      
      await this.handlePaymentSuccess(metadata);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(metadata: Stripe.Metadata | null | undefined) {
    const orderId = metadata?.orderId;
    const userId = metadata?.userId; // Optional

    if (!orderId) {
        this.logger.error('Error: No orderId in metadata');
        return;
    }

    this.logger.log(`Processing Order: ${orderId}`);
    
    try {
        // 1. Update Order Status
        const order = await this.ordersService.updateStatus(orderId, 'PAID');
        this.logger.log(`Order updated to PAID: ${order.id}`);

        // 2. Clear Cart
        const sessionId = metadata?.sessionId;
        if (sessionId) {
            await this.cartService.clearCart(sessionId);
            this.logger.log(`Cleared cart for session ${sessionId}`);
        }

        // 3. Send Receipt Email
        if (order.email) {
            this.logger.log(`Sending email to ${order.email}`);
            await this.mailService.sendPurchaseReceipt(
                order.email, 
                order.id, 
                order.total, 
                order.items.map((item: any) => ({
                    name: item.product?.name || 'Product',
                    quantity: item.quantity,
                    price: item.price
                }))
            );
            this.logger.log('Email sent successfully');
        }
    } catch(e) {
        this.logger.error(`Error processing order ${orderId}: ${e.message}`);
    }
  }
}
