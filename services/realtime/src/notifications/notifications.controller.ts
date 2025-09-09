import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  async sendNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Headers('service-key') serviceKey: string,
  ) {
    // Validate service key for inter-service communication
    if (!serviceKey || serviceKey !== process.env.SERVICE_KEY) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.notificationsService.sendNotification(createNotificationDto);
  }

  @Post('broadcast')
  async broadcastNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Headers('service-key') serviceKey: string,
  ) {
    // Validate service key for inter-service communication
    if (!serviceKey || serviceKey !== process.env.SERVICE_KEY) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.notificationsService.broadcastNotification(createNotificationDto);
  }
}