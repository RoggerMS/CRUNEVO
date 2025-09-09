import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  MESSAGE = 'message',
  POST = 'post',
  SYSTEM = 'system',
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly redisService: RedisService) {}

  async sendNotification(createNotificationDto: CreateNotificationDto) {
    try {
      const notification: Notification = {
        id: this.generateId(),
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        data: createNotificationDto.data,
        read: false,
        createdAt: new Date(),
      };

      // Store notification in Redis with TTL (30 days)
      const notificationKey = `notification:${notification.id}`;
      await this.redisService.set(notificationKey, notification, 30 * 24 * 60 * 60);

      // Add to user's notification list
      const userNotificationsKey = `user:${notification.userId}:notifications`;
      await this.redisService.getClient().lpush(userNotificationsKey, notification.id);
      await this.redisService.getClient().expire(userNotificationsKey, 30 * 24 * 60 * 60);

      // Publish to real-time channel
      await this.redisService.publish(`user:${notification.userId}:notifications`, {
        type: 'new_notification',
        notification,
      });

      this.logger.log(`Notification sent to user ${notification.userId}`);
      return { success: true, notificationId: notification.id };
    } catch (error) {
      this.logger.error('Error sending notification:', error);
      throw error;
    }
  }

  async broadcastNotification(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = {
        id: this.generateId(),
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        data: createNotificationDto.data,
        createdAt: new Date(),
      };

      // Publish to broadcast channel
      await this.redisService.publish('broadcast:notifications', {
        type: 'broadcast_notification',
        notification,
      });

      this.logger.log('Broadcast notification sent');
      return { success: true, notificationId: notification.id };
    } catch (error) {
      this.logger.error('Error broadcasting notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0) {
    try {
      const userNotificationsKey = `user:${userId}:notifications`;
      const notificationIds = await this.redisService.getClient().lrange(
        userNotificationsKey,
        offset,
        offset + limit - 1,
      );

      const notifications = [];
      for (const id of notificationIds) {
        const notification = await this.redisService.get<Notification>(`notification:${id}`);
        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      this.logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    try {
      const notificationKey = `notification:${notificationId}`;
      const notification = await this.redisService.get<Notification>(notificationKey);

      if (!notification || notification.userId !== userId) {
        throw new Error('Notification not found or unauthorized');
      }

      notification.read = true;
      await this.redisService.set(notificationKey, notification, 30 * 24 * 60 * 60);

      return { success: true };
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const userNotificationsKey = `user:${userId}:notifications`;
      const notificationIds = await this.redisService.getClient().lrange(userNotificationsKey, 0, -1);

      let unreadCount = 0;
      for (const id of notificationIds) {
        const notification = await this.redisService.get<Notification>(`notification:${id}`);
        if (notification && !notification.read) {
          unreadCount++;
        }
      }

      return unreadCount;
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}