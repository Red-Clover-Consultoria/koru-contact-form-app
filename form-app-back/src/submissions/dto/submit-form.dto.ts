// Primero instala las dependencias de validación si no lo has hecho:
// npm install --save class-validator class-transformer

import { IsNotEmpty, IsObject, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// --- 1. Definición del Payload 'data' (Respuestas)
// El contenido es dinámico, por lo que lo validamos como un objeto no vacío
class SubmissionDataDto {
    [key: string]: string | number;
}

// --- 2. Definición del Payload 'metadata' (Contexto)
class SubmissionMetadataDto {
    @IsOptional()
    @IsString()
    url?: string; // Contexto de dónde se envió [cite: 44]

    @IsOptional()
    @IsString()
    user_agent?: string; // Navegador/OS del usuario [cite: 45]

    @IsOptional()
    @IsString()
    ip_address?: string; // Dirección IP del cliente

    // Campo de seguridad: Honeypot (campo oculto, si tiene valor, es SPAM) [cite: 9, 50]
    @IsOptional()
    @IsString()
    _trap?: string;
}

// --- 3. DTO Principal (Payload del POST /api/forms/submit)
export class SubmitFormDto {
    @IsNotEmpty()
    @IsString()
    app_id: string; // ID único del formulario (ej: "koru-form-123") [cite: 36]

    @IsNotEmpty()
    @IsString()
    website_id: string; // ID del sitio web donde se instaló el widget [cite: 37]

    @IsNotEmpty()
    @IsObject()
    @IsNotEmpty()
    @IsObject()
    data: Record<string, any>; // Las respuestas reales del formulario [cite: 38]

    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @Type(() => SubmissionMetadataDto)
    metadata: SubmissionMetadataDto; // Metadatos de contexto [cite: 43]
}
