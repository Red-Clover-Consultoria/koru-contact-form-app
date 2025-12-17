// src/forms/dto/update-form.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateFormDto } from './create-form.dto';
import { IsOptional, IsIn } from 'class-validator';

// Permite que todos los campos de CreateFormDto sean opcionales
export class UpdateFormDto extends PartialType(CreateFormDto) {
    @IsOptional()
    @IsIn(['active', 'inactive', 'draft'])
    status?: string;
}
