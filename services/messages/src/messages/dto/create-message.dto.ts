import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  DELETED = 'DELETED',
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;
}