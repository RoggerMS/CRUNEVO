import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'messages-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getInfo() {
    return {
      service: 'CRUNEVO Messages Service',
      version: '0.1.0',
      description: 'Real-time messaging and chat functionality',
      endpoints: {
        health: '/api/health',
        conversations: '/api/conversations',
        messages: '/api/messages',
        websocket: '/socket.io',
      },
      features: [
        'Real-time messaging',
        'Conversation management',
        'WebSocket support',
        'Message history',
        'Online status tracking',
      ],
    };
  }
}