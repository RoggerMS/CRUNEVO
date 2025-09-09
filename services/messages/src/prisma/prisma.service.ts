import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('📦 Messages Service connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('📦 Messages Service disconnected from database');
  }
}