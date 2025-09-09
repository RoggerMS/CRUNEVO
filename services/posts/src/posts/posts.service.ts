import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    const { content, mediaUrls, visibility } = createPostDto

    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      throw new BadRequestException('Post must have content or media')
    }

    const post = await this.prisma.post.create({
      data: {
        content,
        mediaUrls: mediaUrls || [],
        isPublic: visibility !== 'private',
        userId: userId
      },
      include: {
        user: {
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
            comments: true
          }
        }
      }
    })

    return post
  }

  async findAll(options: { page: number; limit: number; userId?: string }) {
    const { page, limit, userId } = options
    const skip = (page - 1) * limit

    const where = userId ? { userId: userId } : {}

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
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
              comments: true
            }
          }
        }
      }),
      this.prisma.post.count({ where })
    ])

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getFeed(userId: string, options: { page: number; limit: number }) {
    const { page, limit } = options
    const skip = (page - 1) * limit

    // Get posts from followed users and own posts
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          OR: [
            { userId: userId },
            {
              user: {
            followers: {
              some: {
                followerId: userId
              }
            }
          }
            }
          ]
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
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
              comments: true
            }
          },
          likes: {
            where: { userId },
            select: { id: true }
          }
        }
      }),
      this.prisma.post.count({
        where: {
          OR: [
            { userId: userId },
            {
              user: {
                followers: {
                  some: {
                    followerId: userId
                  }
                }
              }
            }
          ]
        }
      })
    ])

    // Add isLiked flag
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined
    }))

    return {
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
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
            comments: true
          }
        }
      }
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    return post
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only update your own posts')
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        user: {
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
            comments: true
          }
        }
      }
    })

    return updatedPost
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts')
    }

    await this.prisma.post.delete({
      where: { id }
    })

    return { message: 'Post deleted successfully' }
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        unique_user_post_like: {
          userId,
          postId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await this.prisma.like.delete({
        where: { id: existingLike.id }
      })
      return { liked: false, message: 'Post unliked' }
    } else {
      // Like
      await this.prisma.like.create({
        data: {
          userId,
          postId
        }
      })
      return { liked: true, message: 'Post liked' }
    }
  }

  async getLikes(postId: string, options: { page: number; limit: number }) {
    const { page, limit } = options
    const skip = (page - 1) * limit

    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              isVerified: true
            }
          }
        }
      }),
      this.prisma.like.count({ where: { postId } })
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