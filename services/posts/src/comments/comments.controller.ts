import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { AuthGuard } from '../auth/auth.guard'
import { Public } from '../auth/public.decorator'

@Controller('comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.id)
  }

  @Get('post/:postId')
  @Public()
  findByPost(
    @Param('postId') postId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10
  ) {
    return this.commentsService.findByPost(postId, { page, limit })
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user.id)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.commentsService.remove(id, req.user.id)
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Request() req) {
    return this.commentsService.toggleLike(id, req.user.id)
  }
}