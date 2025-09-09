import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators';
import { CurrentUser } from '../auth/decorators';
import { User } from '@prisma/client';

@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Public()
  @Get('health')
  health() {
    return { ok: true, service: 'identity' };
  }

  @Public()
  @Get('users/:handle')
  async getUser(@Param('handle') handle: string) {
    const user = await this.users.findByHandle(handle);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      createdAt: user.createdAt
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:handle/profile')
  async getUserProfile(@Param('handle') handle: string, @CurrentUser() currentUser: User) {
    const user = await this.users.findByHandle(handle, currentUser.username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
