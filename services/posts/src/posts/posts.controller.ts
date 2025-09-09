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
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { AuthGuard } from '../auth/auth.guard'
import { Public } from '../auth/public.decorator'

@Controller('posts')
@UseGuards(AuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.id)
  }

  @Get()
  @Public()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('userId') userId?: string
  ) {
    return this.postsService.findAll({ page, limit, userId })
  }

  @Get('feed')
  getFeed(
    @Request() req,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10
  ) {
    return this.postsService.getFeed(req.user.id, { page, limit })
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req
  ) {
    return this.postsService.update(id, updatePostDto, req.user.id)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(id, req.user.id)
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Request() req) {
    return this.postsService.toggleLike(id, req.user.id)
  }

  @Get(':id/likes')
  @Public()
  getLikes(
    @Param('id') id: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10
  ) {
    return this.postsService.getLikes(id, { page, limit })
  }
}