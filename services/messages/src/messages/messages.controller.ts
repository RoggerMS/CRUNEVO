import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Headers('user-id') userId: string,
  ) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
    }
    return this.messagesService.createMessage(createMessageDto, userId);
  }

  @Get(':id')
  async getMessage(
    @Param('id') id: string,
    @Headers('user-id') userId: string,
  ) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
    }
    return this.messagesService.getMessage(id, userId);
  }

  @Delete(':id')
  async deleteMessage(
    @Param('id') id: string,
    @Headers('user-id') userId: string,
  ) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
    }
    return this.messagesService.deleteMessage(id, userId);
  }
}