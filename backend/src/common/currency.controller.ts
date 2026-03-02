import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(
    private readonly currencyService: CurrencyService
  ) {}

  @Get('rates')
  async getRates() {
    return this.currencyService.getRates();
  }

  @Get('convert')
  async convert(
    @Query('amount') amount: string,
    @Query('to') to: string
  ) {
    const converted = await this.currencyService.convertFromUSD(Number(amount), to);
    return { amount: converted };
  }
}
