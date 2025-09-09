import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Headers('user-id') userId: string,
  ) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
    }
    return this.conversationsService.createConversation(createConversationDto, userId);
  }

  @Get()
  async getUserConversations(
    @Headers('user-id') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
    }
    return this.conversationsService.getUserConversations(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  async getConversation(
    @Param('id') id: string,
    @Headers('user-id') userId: string,
  ) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
    }
    return this.conversationsService.getConversation(id, userId);
  }

  @Get(':id/messages')
  async getConversationMessages(
    @Param('id') id: string,
    @Headers('user-id') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
    }
    return this.conversationsService.getConversationMessages(
      id,
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }
}