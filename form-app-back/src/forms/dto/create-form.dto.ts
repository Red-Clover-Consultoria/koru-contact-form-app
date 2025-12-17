// src/forms/dto/create-form.dto.ts

import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldConfigDto, LayoutSettingsDto, EmailSettingsDto } from './sub-dtos';

export class CreateFormDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    // El 'owner_id' se inyectará desde el JWT en el Controller, no en el Body

    @IsNotEmpty()
    @IsString()
    app_id: string; // ID único del formulario (ej: koru-form-123)

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldConfigDto)
    fields_config: FieldConfigDto[]; // Lista de objetos Field [cite: 14]

    @ValidateNested()
    @Type(() => LayoutSettingsDto)
    layout_settings: LayoutSettingsDto; // Diseño [cite: 27]

    @ValidateNested()
    @Type(() => EmailSettingsDto)
    email_settings: EmailSettingsDto; // Correo [cite: 29]
}
