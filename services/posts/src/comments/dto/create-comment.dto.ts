import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator'

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  content: string

  @IsString()
  @IsUUID()
  postId: string

  @IsOptional()
  @IsString()
  @IsUUID()
  parentId?: string
}