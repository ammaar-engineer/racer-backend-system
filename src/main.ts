import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomGlobalException } from './GlobalException';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'debug']

  });

  // Set swagger
  const config = new DocumentBuilder()
    .setTitle("Racer Backend endpoints")
    .setDescription("Endpoint for RacerCLI system")
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, documentFactory)


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))
  app.useGlobalFilters(new CustomGlobalException())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
