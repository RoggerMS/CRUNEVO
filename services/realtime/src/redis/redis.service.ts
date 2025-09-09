import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;
  private redisSubscriber: Redis;
  private redisPublisher: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get('REDIS_URL') || 'redis://localhost:6379';
    
    try {
      // Main Redis client
      this.redisClient = new Redis(redisUrl);

      // Subscriber client
      this.redisSubscriber = new Redis(redisUrl);

      // Publisher client
      this.redisPublisher = new Redis(redisUrl);

      this.logger.log('Redis connections established');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    if (this.redisSubscriber) {
      await this.redisSubscriber.quit();
    }
    if (this.redisPublisher) {
      await this.redisPublisher.quit();
    }
    this.logger.log('Redis connections closed');
  }

  getClient(): Redis {
    return this.redisClient;
  }

  getSubscriber(): Redis {
    return this.redisSubscriber;
  }

  getPublisher(): Redis {
    return this.redisPublisher;
  }

  // Cache operations
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.redisClient.setex(key, ttl, serializedValue);
    } else {
      await this.redisClient.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<void> {
    const serializedMessage = JSON.stringify(message);
    await this.redisPublisher.publish(channel, serializedMessage);
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await this.redisSubscriber.subscribe(channel);
    this.redisSubscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          this.logger.error('Error parsing Redis message:', error);
        }
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.redisSubscriber.unsubscribe(channel);
  }

  // Set operations for online users
  async addToSet(key: string, value: string): Promise<void> {
    await this.redisClient.sadd(key, value);
  }

  async removeFromSet(key: string, value: string): Promise<void> {
    await this.redisClient.srem(key, value);
  }

  async getSetMembers(key: string): Promise<string[]> {
    return await this.redisClient.smembers(key);
  }

  async isSetMember(key: string, value: string): Promise<boolean> {
    const result = await this.redisClient.sismember(key, value);
    return result === 1;
  }
}