import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module';
import { CartModule } from '../cart/cart.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    OrdersModule,
    CartModule,
    MailModule,
  ],
  controllers: [PaymentController, StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class PaymentsModule {}
