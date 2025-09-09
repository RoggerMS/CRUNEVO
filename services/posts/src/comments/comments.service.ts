import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const { content, postId, parentId } = createCommentDto

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Comment content cannot be empty')
    }

    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    // If replying to a comment, verify parent comment exists
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId }
      })

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found')
      }

      if (parentComment.postId !== postId) {
        throw new BadRequestException('Parent comment does not belong to this post')
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
        parentId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    })

    return comment
  }

  async findByPost(postId: string, options: { page: number; limit: number }) {
    const { page, limit } = options
    const skip = (page - 1) * limit

    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          postId,
          parentId: null // Only top-level comments
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              isVerified: true
            }
          },
          _count: {
            select: {
              likes: true,
              replies: true
            }
          },
          replies: {
            take: 3, // Show first 3 replies
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                  isVerified: true
                }
              },
              _count: {
                select: {
                  likes: true
                }
              }
            }
          }
        }
      }),
      this.prisma.comment.count({
        where: {
          postId,
          parentId: null
        }
      })
    ])

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isVerified: true
              }
            },
            _count: {
              select: {
                likes: true
              }
            }
          }
        }
      }
    })

    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    return comment
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only update your own comments')
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    })

    return updatedComment
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments')
    }

    await this.prisma.comment.delete({
      where: { id }
    })

    return { message: 'Comment deleted successfully' }
  }

  async toggleLike(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await this.prisma.like.delete({
        where: { id: existingLike.id }
      })
      return { liked: false, message: 'Comment unliked' }
    } else {
      // Like
      await this.prisma.like.create({
        data: {
          userId,
          commentId
        }
      })
      return { liked: true, message: 'Comment liked' }
    }
  }
}