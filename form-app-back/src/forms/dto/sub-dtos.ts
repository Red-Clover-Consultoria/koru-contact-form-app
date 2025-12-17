// src/forms/dto/sub-dtos.ts

import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

// A. Estructura del Formulario (fields_config) [cite: 14]
export class FieldConfigDto {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsIn(['text', 'email', 'textarea', 'select', 'checkbox', 'number']) // [cite: 21]
    type: string;

    @IsNotEmpty()
    @IsString()
    label: string;

    @IsBoolean()
    required: boolean;

    @IsOptional()
    @IsString()
    options: string; // "Ventas, Soporte, Devoluciones" [cite: 24]

    @IsIn(['100%', '50%']) // [cite: 25]
    width: string;
}

// B. Diseño y Comportamiento (layout_settings) [cite: 27]
export class LayoutSettingsDto {
    @IsIn(['Inline', 'Floating', 'Popup']) // [cite: 28]
    display_type: string;

    @IsIn(['Bottom-Right', 'Bottom-Left']) // [cite: 28]
    position: string;

    @IsIn(['Envelope', 'Chat', 'User', 'Question']) // [cite: 28]
    bubble_icon: string;

    @IsString()
    @IsNotEmpty()
    accent_color: string; // ej: #00C896 [cite: 28]

    @IsString()
    @IsNotEmpty()
    submit_text: string; // ej: "Enviar Mensaje" [cite: 16]

    @IsString()
    @IsNotEmpty()
    success_msg: string; // ej: "¡Gracias! Te responderemos pronto." [cite: 16]

    @IsOptional()
    @IsString()
    redirect_url: string; // URL [cite: 16]
}

// C. Configuración de Correo (email_settings) [cite: 29]
export class EmailSettingsDto {
    @IsString()
    @IsNotEmpty()
    admin_email: string; // Destinatario [cite: 30]

    @IsString()
    @IsNotEmpty()
    subject_line: string; // "Ej: Nuevo contacto web: {{Name}}" [cite: 30]

    @IsBoolean()
    autoresponder: boolean; // Toggle ON/OFF [cite: 30]
}
