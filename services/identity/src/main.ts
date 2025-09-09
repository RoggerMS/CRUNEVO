import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Identity service listening on port ${port}`);
}

bootstrap();
