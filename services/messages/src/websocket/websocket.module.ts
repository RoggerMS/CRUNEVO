import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';

@Module({
  providers: [MessagesGateway, MessagesService, ConversationsService],
  exports: [MessagesGateway],
})
export class WebSocketModule {}