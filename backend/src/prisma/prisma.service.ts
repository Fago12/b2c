import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    console.log('PrismaService: Connecting to DB...');
    try {
      await this.$connect();
      console.log('PrismaService: Connected successfully.');
    } catch (error) {
      console.error('PrismaService: Connection failed', error);
    }
  }
}
