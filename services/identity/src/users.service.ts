import { Injectable } from '@nestjs/common';

interface User {
  id: string;
  handle: string;
  email: string;
}

const demoUser: User = {
  id: '1',
  handle: 'demo',
  email: 'demo@crunevo.local',
};

@Injectable()
export class UsersService {
  private users = [demoUser];

  findByHandle(handle: string, requesterHandle?: string) {
    const user = this.users.find(
      (u) => u.handle.toLowerCase() === handle.toLowerCase(),
    );
    if (!user) return null;
    return {
      id: user.id,
      handle: user.handle,
      email:
        requesterHandle === user.handle
          ? user.email
          : user.email.replace(/(.).+(@.+)/, '$1***$2'),
    };
  }
}
