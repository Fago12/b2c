import { Controller, Post, Body, Req, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CartService } from '../cart/cart.service';
import type { Request } from 'express';

@Controller('payments')
export class PaymentController {
  private logger = new Logger(PaymentController.name);

  constructor(
    private stripeService: StripeService,
    private cartService: CartService,
  ) {}

  private getSessionId(req: Request): string {
    return req.cookies?.['guest_session_id'];
  }

  @Post('create-payment-intent')
  async createPaymentIntent(@Req() req: Request, @Body() body: { sessionId?: string; metadata?: any }) {
    const sessionId = body.sessionId || this.getSessionId(req);
    
    if (!sessionId) {
      throw new HttpException('No session found', HttpStatus.BAD_REQUEST);
    }

    const cart = await this.cartService.getCart(sessionId);
    if (!cart || cart.items.length === 0) {
      this.logger.warn(`Cart empty for session ${sessionId}`);
      throw new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`Creating PaymentIntent for session ${sessionId}: ${cart.chargeTotal} ${cart.chargeCurrency} (Display: ${cart.displayTotal} ${cart.displayCurrency})`);
    
    return this.stripeService.createPaymentIntent(
      cart.chargeTotal, 
      cart.chargeCurrency, 
      {
        ...body.metadata,
        sessionId: sessionId,
        regionCode: cart.regionCode,
        displayTotal: cart.displayTotal,
        displayCurrency: cart.displayCurrency,
      }
    );
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
