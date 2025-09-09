import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global prefix for all routes
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 API Gateway running on http://localhost:${port}`);
  console.log(`📚 Health check: http://localhost:${port}/api/health`);
}

bootstrap();