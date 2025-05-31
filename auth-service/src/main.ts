import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Register custom exception filter globally
  app.useGlobalFilters(new CustomHttpExceptionFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('The authentication service API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the HTTP server only (no NestJS microservice)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Auth service is running on port ${port}`);
}

bootstrap(); 