import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'realtime-service',
    };
  }

  getInfo() {
    return {
      name: 'CRUNEVO Realtime Service',
      version: '1.0.0',
      description: 'Real-time notifications and WebSocket service',
      endpoints: {
        health: '/api/v1/health',
        info: '/api/v1/info',
        websocket: '/socket.io',
      },
    };
  }
}