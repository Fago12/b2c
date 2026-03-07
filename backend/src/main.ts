import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // When rawBody: true is set in NestFactory.create, 
  // NestJS 10+ automatically configures the underlying body-parsers 
  // to preserve the raw body as a Buffer on the request object.
  // We do NOT need to manually add json() or urlencoded() middleware here.

  app.use(cookieParser());
  
  app.enableCors({ 
    origin: [
      'http://localhost:3000', 
      'http://127.0.0.1:3000',
      'http://[::1]:3000'
    ], 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'stripe-signature', 'Idempotency-Key', 'x-admin-request', 'x-region-code'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
