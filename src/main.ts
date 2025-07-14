import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';  
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // --- Configuración de Swagger ---
  const config = new DocumentBuilder()
    .setTitle('API de Acomer') // Título de tu API
    .setDescription('La descripción de la API para mi aplicación NestJS') // Descripción
    .setVersion('1.0') // Versión de la API
    .addTag('users') // Puedes añadir etiquetas para organizar tus endpoints
    .addBearerAuth( // Si usas JWT, esto añade un botón para autorizar con un token
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth' // Nombre de la configuración de seguridad
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 'api' es la ruta donde se servirá la documentación (ej: http://localhost:3000/api)
  // --- Fin de la configuración de Swagger ---

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(3000);
}
bootstrap();
