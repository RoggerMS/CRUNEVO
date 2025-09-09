import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  )

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3002)

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173'
    ],
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
  app.setGlobalPrefix('api/v1')

  await app.listen(port, '0.0.0.0')
  console.log(`🚀 Posts service is running on: http://localhost:${port}`)
}

bootstrap().catch((error) => {
  console.error('❌ Error starting posts service:', error)
  process.exit(1