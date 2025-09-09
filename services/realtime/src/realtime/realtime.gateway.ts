import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../redis/redis.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.subscribeToNotifications();
  }

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.user = payload;

      // Store connection
      this.connectedUsers.set(client.id, client.userId);
      
      // Add to online users in Redis
      await this.redisService.addToSet('online_users', client.userId);
      
      // Join user-specific room
      await client.join(`user_${client.userId}`);
      
      // Notify others that user is online
      client.broadcast.emit('user_online', { userId: client.userId });
      
      this.logger.log(`User ${client.userId} connected`);
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.connectedUsers.get(client.id);
    
    if (userId) {
      // Remove from connected users
      this.connectedUsers.delete(client.id);
      
      // Remove from online users in Redis
      await this.redisService.removeFromSet('online_users', userId);
      
      // Notify others that user is offline
      client.broadcast.emit('user_offline', { userId });
      
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    await client.join(data.roomId);
    client.emit('joined_room', { roomId: data.roomId });
    this.logger.log(`User ${client.userId} joined room ${data.roomId}`);
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    await client.leave(data.roomId);
    client.emit('left_room', { roomId: data.roomId });
    this.logger.log(`User ${client.userId} left room ${data.roomId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; message: string; type?: string },
  ) {
    const messageData = {
      id: Date.now().toString(),
      userId: client.userId,
      user: client.user,
      message: data.message,
      type: data.type || 'text',
      timestamp: new Date().toISOString(),
    };

    // Send to room
    this.server.to(data.roomId).emit('new_message', messageData);
    
    this.logger.log(`Message sent to room ${data.roomId} by user ${client.userId}`);
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    client.to(data.roomId).emit('user_typing', {
      userId: client.userId,
      user: client.user,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    client.to(data.roomId).emit('user_typing', {
      userId: client.userId,
      user: client.user,
      isTyping: false,
    });
  }

  @SubscribeMessage('mark_notification_read')
  async handleMarkNotificationRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    await this.notificationsService.markNotificationAsRead(data.notificationId, client.userId);
    client.emit('notification_marked_read', { notificationId: data.notificationId });
  }

  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const onlineUsers = await this.redisService.getSetMembers('online_users');
    client.emit('online_users', { users: onlineUsers });
  }

  // Method to send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
  }

  // Method to broadcast to all users
  async broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Method to send to specific room
  async sendToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
  }

  private async subscribeToNotifications() {
    try {
      // Wait a bit for Redis to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if subscriber is available
      if (!this.redisService.getSubscriber()) {
        this.logger.warn('Redis subscriber not available, retrying in 2 seconds...');
        setTimeout(() => this.subscribeToNotifications(), 2000);
        return;
      }

      // Subscribe to broadcast notifications
      await this.redisService.subscribe('broadcast:notifications', (message) => {
        this.server.emit('notification', message.notification);
      });

      this.logger.log('Subscribed to Redis notification channels');
    } catch (error) {
      this.logger.error('Error subscribing to notifications:', error);
      // Retry after 5 seconds
      setTimeout(() => this.subscribeToNotifications(), 5000);
    }
  }
}