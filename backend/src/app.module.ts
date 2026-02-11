import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import Redis from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CouponsModule } from './coupons/coupons.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CommonModule } from './common/common.module';
import { CartModule } from './cart/cart.module';
import { QueueModule } from './queues/queue.module';
import { MediaModule } from './media/media.module';
import { ChatModule } from './chat/chat.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { HomepageModule } from './homepage/homepage.module';

@Module({
  imports: [
    // Config Module for environment variables
    ConfigModule.forRoot({ isGlobal: true }),
    // Infrastructure
    PrismaModule,
    RedisModule,
    CommonModule,
    // Rate Limiting - 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),
    // BullMQ with async config to properly load REDIS_URL
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        console.log('[BullMQ] REDIS_URL:', redisUrl ? `${redisUrl.substring(0, 30)}...` : 'not set');
        
        if (redisUrl) {
          // Create IORedis instance from URL for BullMQ
          const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
          return { connection };
        }
        return {
          connection: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: parseInt(configService.get('REDIS_PORT') || '6379'),
            password: configService.get('REDIS_PASSWORD'),
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    QueueModule,
    // Feature Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CouponsModule,
    ReviewsModule,
    MailModule,
    CartModule,
    MediaModule,
    ChatModule,
    PaymentsModule,
    AdminModule,
    AnalyticsModule,
    SettingsModule,
    CloudinaryModule,
    HomepageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}







