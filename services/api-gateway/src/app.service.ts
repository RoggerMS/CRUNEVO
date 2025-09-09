import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '0.1.0',
      uptime: process.uptime(),
    };
  }

  getInfo() {
    return {
      name: 'CRUNEVO API Gateway',
      description: 'Central routing and authentication service for CRUNEVO social network',
      version: '0.1.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth/*',
        users: '/api/users/*',
        posts: '/api/posts/*',
        messages: '/api/messages/*',
        search: '/api/search/*',
      },
    };
  }
}