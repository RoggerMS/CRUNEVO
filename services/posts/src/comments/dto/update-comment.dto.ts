import { IsString, IsOptional, MaxLength } from 'class-validator'

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  content?: string
}