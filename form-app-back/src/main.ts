import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as crypto from 'crypto';

// Polyfill para Node.js v18 (Railway) - ScheduleModule usa globalThis.crypto.randomUUID()
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => crypto.randomUUID(),
    },
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo Global para la API
  app.setGlobalPrefix('api');

  // Filtro Global de Excepciones para seguridad (fuga de datos)
  app.useGlobalFilters(new GlobalExceptionFilter());

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
    transform: true, // Transforma los tipos de los datos
  }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
