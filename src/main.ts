import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';  
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // --- Configuración de Swagger ---
  const config = new DocumentBuilder()
    .setTitle('ACOMER_V1 API')
    .setDescription('Documentación de la API para la gestión de comandas del restaurante ACOMER_v1')
    .setVersion('1.0') // Versión de la API
    .addTag('auth', 'Operaciones de autenticación y autorización')
    .addTag('comandas', 'Gestión de comandas y sus estados')
    .addTag('detalle-comandas', 'Gestión de los detalles de las comandas (productos en la comanda)')
    .addTag('productos', 'Gestión de productos del menú')
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
  SwaggerModule.setup('api', app, document); //(ej: http://localhost:3000/api)
  // --- Fin de la configuración de Swagger ---

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(parseInt(process.env.PORT || '3000', 10));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
