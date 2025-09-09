import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async createConversation(createConversationDto: CreateConversationDto, userId: string) {
    const { participantIds, type = 'DIRECT', name } = createConversationDto;

    // Add the creator to participants if not already included
    const allParticipants = participantIds.includes(userId) 
      ? participantIds 
      : [userId, ...participantIds];

    // For direct conversations, ensure only 2 participants
    if (type === 'DIRECT' && allParticipants.length !== 2) {
      throw new HttpException(
        'Direct conversations must have exactly 2 participants',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if direct conversation already exists
    if (type === 'DIRECT') {
      const existingConversation = await this.prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: { in: allParticipants },
            },
          },
        },
        include: {
          participants: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      });

      if (existingConversation && existingConversation.participants.length === 2) {
        return existingConversation;
      }
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        type,
        name,
        participants: {
          create: allParticipants.map(participantId => ({
            userId: participantId,
          })),
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return conversation;
  }

  async getUserConversations(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: limit,
    });

    const total = await this.prisma.conversation.count({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
    });

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    }

    return conversation;
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Verify user is participant
    const conversation = await this.getConversation(conversationId, userId);

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