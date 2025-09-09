import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('health')
  health() {
    return { ok: true, service: 'identity' };
  }

  @Get('users/:handle')
  getUser(@Param('handle') handle: string) {
    const user = this.users.findByHandle(handle);
    if (!user) {
      return { error: 'not_found' };
    }
    return user;
  }
}
