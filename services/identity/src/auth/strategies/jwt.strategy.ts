import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../../users/users.service'

export interface JwtPayload {
  sub: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    const jwtSecret = configService?.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-identity-service-2024'
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }
    
    return user
  }
}