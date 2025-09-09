import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private conversationsService: ConversationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract user ID from query or headers
      const userId = client.handshake.query.userId as string;
      
      if (!userId) {
        this.logger.warn(`Connection rejected: No user ID provided`);
        client.disconnect();
        return;
      }

      client.userId = userId;
      this.connectedUsers.set(userId, client.id);
      
      // Join user to their conversation rooms
      const userConversations = await this.conversationsService.getUserConversations(userId, 1, 100);
      
      for (const conversation of userConversations.conversations) {
        await client.join(`conversation:${conversation.id}`);
      }

      // Notify others that user is online
      client.broadcast.emit('user:online', { userId });
      
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      
      // Notify others that user is offline
      client.broadcast.emit('user:offline', { userId: client.userId });
      
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      // Create the message
      const message = await this.messagesService.createMessage(data, client.userId);
      
      // Emit to all participants in the conversation
      this.server.to(`conversation:${data.conversationId}`).emit('message:new', {
        message,
        conversationId: data.conversationId,
      });

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      // Verify user has access to this conversation
      await this.conversationsService.getConversation(data.conversationId, client.userId);
      
      // Join the conversation room
      await client.join(`conversation:${data.conversationId}`);
      
      this.logger.log(`User ${client.userId} joined conversation ${data.conversationId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Join conversation error: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      await client.leave(`conversation:${data.conversationId}`);
      
      this.logger.log(`User ${client.userId} left conversation ${data.conversationId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Leave conversation error: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;
    
    client.to(`conversation:${data.conversationId}`).emit('typing:start', {
      userId: client.userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;
    
    client.to(`conversation:${data.conversationId}`).emit('typing:stop', {
      userId: client.userId,
      conversationId: data.conversationId,
    });
  }

  // Method to send message from external services
  async sendMessageToConversation(conversationId: string, message: any) {
    this.server.to(`conversation:${conversationId}`).emit('message:new', {
      message,
      conversationId,
    });
  }

  // Method to check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Method to get online users
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}