import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe
} from '@nestjs/common'
import { LikesService } from './likes.service'
import { AuthGuard } from '../auth/auth.guard'
import { Public } from '../auth/public.decorator'

@Controller('likes')
@UseGuards(AuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('post/:postId')
  likePost(@Param('postId') postId: string, @Request() req) {
    return this.likesService.likePost(postId, req.user.id)
  }

  @Delete('post/:postId')
  unlikePost(@Param('postId') postId: string, @Request() req) {
    return this.likesService.unlikePost(postId, req.user.id)
  }

  @Post('comment/:commentId')
  likeComment(@Param('commentId') commentId: string, @Request() req) {
    return this.likesService.likeComment(commentId, req.user.id)
  }

  @Delete('comment/:commentId')
  unlikeComment(@Param('commentId') commentId: string, @Request() req) {
    return this.likesService.unlikeComment(commentId, req.user.id)
  }

  @Get('user/:userId')
  @Public()
  getUserLikes(
    @Param('userId') userId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10
  ) {
    return this.likesService.getUserLikes(userId, { page, limit })
  }
}