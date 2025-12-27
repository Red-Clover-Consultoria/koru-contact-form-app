import {
    Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Headers,
    UnauthorizedException, ForbiddenException, Query, BadRequestException, Req, UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('forms')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    // ==========================================
    // ENDPOINTS DE GESTIÓN (CRUD) - MODO DESARROLLO SIN AUTENTICACIÓN
    // ==========================================

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() createFormDto: CreateFormDto) {
        return this.formsService.create(createFormDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.formsService.findAll();
    }


    // ==========================================
    // ENDPOINTS DE GESTIÓN (CONTINUACIÓN)
    // ==========================================

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.formsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
        return this.formsService.update(id, updateFormDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.formsService.remove(id);
    }

    @UseGuards(JwtAuthGuard)
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

    @UseGuards(JwtAuthGuard)
    @Get(':id/validate-permissions')
    async validatePermissions(
        @Param('id') id: string,
        @Req() req: Request
    ) {
        const koruUser = req['koruUser'];
        return this.formsService.validatePermissions(id, koruUser);
    }
}
