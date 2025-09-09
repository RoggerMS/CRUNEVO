import { IsArray, IsEnum, IsOptional, IsString, ArrayMinSize } from 'class-validator';

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export class CreateConversationDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  participantIds: string[];

  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType = ConversationType.DIRECT;

  @IsOptional()
  @IsString()
  name?: string;
}