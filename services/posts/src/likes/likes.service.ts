import {
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async likePost(postId: string, userId: string) {
    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        unique_user_post_like: {
          userId,
          postId
        }
      }
    })

    if (existingLike) {
      throw new ConflictException('Post already liked')
    }

    const like = await this.prisma.like.create({
      data: {
        userId,
        postId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    })

    return { message: 'Post liked successfully', like }
  }

  async unlikePost(postId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        unique_user_post_like: {
          userId,
          postId
        }
      }
    })

    if (!existingLike) {
      throw new NotFoundException('Like not found')
    }

    await this.prisma.like.delete({
      where: { id: existingLike.id }
    })

    return { message: 'Post unliked successfully' }
  }

  async likeComment(commentId: string, userId: string) {
    // Verify comment exists
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        unique_user_comment_like: {
          userId,
          commentId
        }
      }
    })

    if (existingLike) {
      throw new ConflictException('Comment already liked')
    }

    const like = await this.prisma.like.create({
      data: {
        userId,
        commentId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    })

    return { message: 'Comment liked successfully', like }
  }

  async unlikeComment(commentId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        unique_user_comment_like: {
          userId,
          commentId
        }
      }
    })

    if (!existingLike) {
      throw new NotFoundException('Like not found')
    }

    await this.prisma.like.delete({
      where: { id: existingLike.id }
    })

    return { message: 'Comment unliked successfully' }
  }

  async getUserLikes(userId: string, options: { page: number; limit: number }) {
    const { page, limit } = options
    const skip = (page - 1) * limit

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          post: {
            select: {
              id: true,
              content: true,
              mediaUrls: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true
                }
              }
            }
          },
          comment: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true
                }
              },
              post: {
                select: {
                  id: true,
                  content: true
                }
              }
            }
          }
        }
      }),
      this.prisma.like.count({ where: { userId } })
    ])

    return {
      likes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}