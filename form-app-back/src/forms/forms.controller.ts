// src/forms/forms.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

// Eliminamos guards a nivel de clase para permitir endpoints públicos
@Controller('forms')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Validamos DTOs globalmente en el controller
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    // ==========================================
    // ENDPOINTS DE GESTIÓN (CRUD) - MODO DESARROLLO SIN AUTENTICACIÓN
    // ==========================================

    /**
     * Crear formulario
     *
     * MODO DEV (sin auth):
     *  - No requiere JWT.
     *  - `owner_id` se resuelve internamente en FormsService usando un cliente de pruebas.
     *
     * MODO PROD (con auth de Koru):
     *  - Volver a activar AuthGuard/RolesGuard.
     *  - Pasar `req.user.id` como ownerId explícito a FormsService.create().
     */
    @Post()
    async create(@Body() createFormDto: CreateFormDto) {
        return this.formsService.create(createFormDto);
    }

    /**
     * Listar formularios
     *
     * MODO DEV (sin auth):
     *  - Devuelve todos los formularios existentes (equivalente a rol admin).
     *
     * MODO PROD (con auth de Koru):
     *  - Rehabilitar guards y filtrar por `req.user.id` para clientes.
     */
    @Get()
    async findAll() {
        return this.formsService.findAll();
    }

    // ==========================================
    // ENDPOINT PÚBLICO (WIDGET DE FRONTEND)
    // ==========================================

    @Get('config/:formId')
    async getConfig(@Param('formId') formId: string) {
        return this.formsService.findConfigByFormId(formId);
    }

    // ==========================================
    // ENDPOINTS DE GESTIÓN (CONTINUACIÓN)
    // ==========================================

    /**
     * Obtener un formulario por ID
     *
     * MODO DEV: sin auth, actúa como admin (no filtra por owner).
     * MODO PROD: volver a activar guards y pasar `req.user.id` para aplicar multi-tenant.
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.formsService.findOne(id);
    }

    /**
     * Actualizar formulario
     *
     * MODO DEV: sin auth, permite actualizar cualquier formulario.
     * MODO PROD: volver a activar guards y filtrar por owner para clientes.
     */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
        return this.formsService.update(id, updateFormDto);
    }

    /**
     * Eliminar formulario
     *
     * MODO DEV: sin auth, permite borrar cualquier formulario.
     * MODO PROD: volver a activar guards y filtrar por owner para clientes.
     */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.formsService.remove(id);
    }

    /**
     * Activar formulario tras validación con Koru Suite
     */
    @Post(':id/activate')
    async activate(
        @Param('id') id: string,
        @Body('websiteId') websiteId: string,
        @Body('userId') userId?: string
    ) {
        const effectiveUserId = userId || '676d6540c946f04c6439e623';
        const koruToken = 'simulated_token';

        return this.formsService.activate(id, websiteId, koruToken, effectiveUserId);
    }
}
