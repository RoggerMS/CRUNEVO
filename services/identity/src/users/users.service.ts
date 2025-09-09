import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { User, Credential } from '@prisma/client'
import * as bcrypt from 'bcrypt'

export interface CreateUserData {
  email: string
  username: string
  displayName: string
  password: string
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    return this.prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        credentials: {
          create: {
            provider: 'local',
            passwordHash: hashedPassword
          }
        }
      }
    })
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    if (!user) return null

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    })
  }

  async findByUsername(username: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { username }
    })

    if (!user) return null

    return user
  }

  async findByHandle(handle: string, requesterHandle?: string): Promise<any> {
    const user = await this.findByUsername(handle)
    if (!user) return null

    return {
      id: user.id,
      handle: user.username,
      email: requesterHandle === user.username
        ? user.email
        : user.email.replace(/(.).+(@.+)/, '$1***$2')
    }
  }

  async updateProfile(id: string, updateData: Partial<Pick<User, 'displayName' | 'bio' | 'avatarUrl'>>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData
    })

    return user
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.prisma.user.delete({ where: { id } })
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    const credential = await this.prisma.credential.findFirst({
      where: {
        userId: user.id,
        provider: 'local'
      }
    })
    
    if (!credential?.passwordHash) {
      return false
    }
    
    return bcrypt.compare(password, credential.passwordHash)
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {}
    })
  }
}
