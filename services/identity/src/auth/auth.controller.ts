import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { Public, CurrentUser } from './decorators'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { User } from '@prisma/client'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: any, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id)
  }

  @Public()
  @Post('validate-token')
  async validateToken(@Body('token') token: string) {
    return this.authService.validateToken(token)
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@CurrentUser() user: User) {
    return this.authService.refreshToken(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id)
  }
}