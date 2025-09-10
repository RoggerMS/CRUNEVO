import { IsString, IsOptional, IsArray, IsEnum, MaxLength } from 'class-validator'
import { PostVisibility } from './create-post.dto'

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Content must not exceed 2000 characters' })
  content?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[]

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility
}