import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend (Vite) y Koru Suite
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://www.korusuite.com', 'http://localhost:5173', 'http://localhost:5174'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Validación Global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // Lanza error si llegan propiedades extra
    transform: true, // Transforma los tipos de los datos (ej: string '1' a number 1)
  }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
