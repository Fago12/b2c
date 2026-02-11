import { Controller, Post, Body, Req, Logger, Headers, RawBodyRequest, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express';

@Controller('payments')
export class PaymentController {
  private logger = new Logger(PaymentController.name);

  constructor(private stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number; metadata?: any }) {
    return this.stripeService.createPaymentIntent(body.amount, 'usd', body.metadata);
  }

  @Post('update-payment-intent')
  async updatePaymentIntent(@Body() body: { paymentIntentId: string; metadata: any }) {
      this.logger.log(`Received update for PI: ${body.paymentIntentId}`);
      try {
          return await this.stripeService.updatePaymentIntent(body.paymentIntentId, body.metadata);
      } catch (e) {
          this.logger.error(`Update Failed: ${e.message}`);
          throw e;
      }
  }
}
