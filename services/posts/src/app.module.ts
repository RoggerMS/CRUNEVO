import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { PostsModule } from './posts/posts.module'
import { CommentsModule } from './comments/comments.module'
import { LikesModule } from './likes/likes.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    PrismaModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    LikesModule
  ]
})
export class AppModule {}