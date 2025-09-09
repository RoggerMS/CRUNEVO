import { IsString, IsOptional, IsArray, IsEnum, MaxLength } from 'class-validator'

export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private'
}

export class CreatePostDto {
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