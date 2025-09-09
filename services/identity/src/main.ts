import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )

  const configService = app.get(ConfigService)

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  // Global prefix
  app.setGlobalPrefix(configService.get<string>('API_PREFIX', 'api/v1'))

  const port = configService.get<number>('PORT', 3001)
  await app.listen(port, '0.0.0.0')
  console.log(`Identity service listening on port ${port}`)
}

bootstrap()
