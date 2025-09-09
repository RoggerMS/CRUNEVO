import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto, userId: string) {
    const { conversationId, content, type = 'TEXT' } = createMessageDto;

    // Verify user is participant in the conversation
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
          },
        },
      },
    });

    if (!conversation) {
      throw new HttpException(
        'Conversation not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        content,
        type,
        senderId: userId,
        conversationId,
      },
    });

    // Update conversation's updatedAt timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          participants: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        conversation: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
      },
    });

    if (!message) {
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
    }

    return message;
  }

  async deleteMessage(messageId: string, userId: string) {
    // Verify the message exists and user is the sender
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    if (!message) {
      throw new HttpException(
        'Message not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }

    // Soft delete by updating content
    const deletedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: '[Message deleted]',
        type: 'DELETED',
        updatedAt: new Date(),
      },
    });

    return deletedMessage;
  }

  async getMessagesByConversation(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Verify user is participant
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
          },
        },
      },
    });

    if (!conversation) {
      throw new HttpException(
        'Conversation not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }

    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const total = await this.prisma.message.count({
      where: {
        conversationId,
      },
    });

    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}