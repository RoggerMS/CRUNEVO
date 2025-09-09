import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    const databaseUrl = configService?.get<string>('DATABASE_URL') || process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/identity_db'
    const nodeEnv = configService?.get<string>('NODE_ENV') || process.env.NODE_ENV || 'development'
    
    super({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  async cleanDb() {
    const nodeEnv = this.configService?.get<string>('NODE_ENV') || process.env.NODE_ENV || 'development'
    if (nodeEnv === 'production') {
      return
    }

    const models = Reflect.ownKeys(this).filter(key => typeof key === 'string' && key[0] !== '_')

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this] as any
        if (model && typeof model.deleteMany === 'function') {
          return model.deleteMany()
        }
      })
    )
  }
}