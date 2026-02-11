import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.use(cookieParser());
  app.enableCors({ 
    origin: 'http://localhost:3000', 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'stripe-signature', 'Idempotency-Key'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
  // Listen on 0.0.0.0 to avoid IPv4/IPv6 resolution issues
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
