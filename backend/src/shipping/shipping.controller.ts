import { Controller, Post, Body, Get } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('calculate')
  async calculateShipping(@Body() body: { country: string; state?: string }) {
    const cost = await this.shippingService.calculateShippingCost(body.country, body.state);
    return { cost };
  }
}
