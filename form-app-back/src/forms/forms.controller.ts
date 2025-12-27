import {
    Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Headers,
    UnauthorizedException, ForbiddenException, Query, BadRequestException, Req
} from '@nestjs/common';
import { Request } from 'express';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Controller('forms')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    // ==========================================
    // ENDPOINTS DE GESTIÓN (CRUD) - MODO DESARROLLO SIN AUTENTICACIÓN
    // ==========================================

    @Post()
    async create(@Body() createFormDto: CreateFormDto, @Req() req: Request) {
        // En Koru Suite, el primer sitio del usuario se asigna como dueño por defecto
        const koruUser = req['koruUser'];
        const ownerId = koruUser?.websites?.[0]; // Usamos el ID de sitio de Koru como owner
        return this.formsService.create(createFormDto, ownerId);
    }

    @Get()
    async findAll(@Req() req: Request) {
        const koruUser = req['koruUser'];
        // Si es cliente, solo ve sus sitios. Si no tiene sitios, no ve nada.
        return this.formsService.findAll(koruUser?.websites);
    }


    // ==========================================
    // ENDPOINTS DE GESTIÓN (CONTINUACIÓN)
    // ==========================================

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: Request) {
        const koruUser = req['koruUser'];
        return this.formsService.findOne(id, koruUser?.websites);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto, @Req() req: Request) {
        const koruUser = req['koruUser'];
        return this.formsService.update(id, updateFormDto, koruUser?.websites);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: Request) {
        const koruUser = req['koruUser'];
        return this.formsService.remove(id, koruUser?.websites);
    }

    @Patch(':id/activate')
    async activate(
        @Param('id') id: string,
        @Body('websiteId') websiteId: string,
        @Headers('Authorization') authHeader: string
    ) {
        // Extraer token Bearer
        const koruToken = authHeader?.replace('Bearer ', '');
        return this.formsService.activate(id, websiteId, koruToken);
    }

    @Get('config/:id')
    async getConfig(
        @Param('id') id: string,
        @Query('websiteId') websiteId: string
    ) {
        if (!websiteId) {
            throw new BadRequestException('Se requiere websiteId para cargar la configuración.');
        }
        return this.formsService.getFormConfig(id, websiteId);
    }

    @Get(':id/validate-permissions')
    async validatePermissions(
        @Param('id') id: string,
        @Req() req: Request
    ) {
        const koruUser = req['koruUser'];
        return this.formsService.validatePermissions(id, koruUser);
    }
}
