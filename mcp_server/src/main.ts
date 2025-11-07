import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);
  const configService = nestApp.get(ConfigService);

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API documentation for RM Task Management System')
    .setVersion('1.0')
    .addTag('tasks', 'Task management endpoints')
    .addTag('customers', 'Customer management endpoints')
    .build();

  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup('api', nestApp, document);

  nestApp.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  const port = configService.get<number>('app.port') ?? 3000;
  await nestApp.listen(port);
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api`);
}
bootstrap().catch(console.error);
