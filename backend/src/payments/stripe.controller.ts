import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import type { Request } from 'express';

@Controller('webhook')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('stripe')
  async handleStripeWebhook(@Headers('stripe-signature') signature: string, @Req() request: Request) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // IMPORTANT: NestJS with rawBody: true attaches the raw buffer to request.rawBody
    // We must use this buffer for signature verification.
    const rawBody = (request as any).rawBody;

    if (!rawBody) {
        throw new BadRequestException('Raw body not available. Ensure app is configured with rawBody: true');
    }

    try {
      return await this.stripeService.handleWebhook(signature, rawBody);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
