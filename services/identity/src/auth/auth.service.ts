import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password, displayName } = registerDto

    // Use the users service to create the user
    const user = await this.usersService.create({
      email,
      username,
      password,
      displayName
    })

    // Generate tokens
    const tokens = await this.generateTokens(user.id)

    return {
      user,
      ...tokens
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await this.usersService.validatePassword(user, password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id)

    return user
  }

  async login(user: any) {
    const tokens = await this.generateTokens(user.id)
    
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      ...tokens
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }
    
    return user
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token)
      const user = await this.usersService.findById(payload.sub)
      
      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      return {
        valid: true,
        user
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid token'
      }
    }
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return this.generateTokens(userId)
  }

  async logout(userId: string) {
    // In a more complex implementation, you might want to blacklist the token
    // For now, we'll just return a success message
    return {
      message: 'Logged out successfully'
    }
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId }
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m')
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
      })
    ])

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m')
    }
  }
}