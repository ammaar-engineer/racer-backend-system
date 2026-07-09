import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomGlobalException } from './GlobalException';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'debug']

  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))
  app.useGlobalFilters(new CustomGlobalException())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
