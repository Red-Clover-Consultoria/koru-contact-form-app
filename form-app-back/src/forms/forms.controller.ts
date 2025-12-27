import {
    Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Headers,
    UnauthorizedException, ForbiddenException, Query, BadRequestException, Req, UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/user.interface';

@Controller('forms')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    // ==========================================
    // ENDPOINTS DE GESTIÓN (CRUD)
    // ==========================================

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() createFormDto: CreateFormDto, @Req() req: RequestWithUser) {
        // En Koru Suite, el primer sitio del usuario se asigna como dueño por defecto
        const user = req.user;
        const ownerId = user?.websites?.[0]; // Usamos el ID de sitio de Koru como owner
        return this.formsService.create(createFormDto, ownerId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Req() req: RequestWithUser) {
        const user = req.user;
        // Si es cliente, solo ve sus sitios. Si no tiene sitios, no ve nada.
        return this.formsService.findAll(user?.websites);
    }


    // ==========================================
    // ENDPOINTS DE GESTIÓN (CONTINUACIÓN)
    // ==========================================

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        return this.formsService.findOne(id, user?.websites);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto, @Req() req: RequestWithUser) {
        const user = req.user;
        return this.formsService.update(id, updateFormDto, user?.websites);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        return this.formsService.remove(id, user?.websites);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/activate')
    async activate(
        @Param('id') id: string,
        @Body('websiteId') websiteId: string,
        @Headers('Authorization') authHeader: string
    ) {
        // Para activar, requerimos el Koru Token original si el handshake lo exige
        // pero aquí usamos el internal guard para asegurar que el usuario está logueado
        const koruToken = authHeader?.replace('Bearer ', '');
        return this.formsService.activate(id, websiteId, koruToken);
    }

    @Get('config/:id') // Público para el Widget
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
        @Req() req: RequestWithUser
    ) {
        const user = req.user;
        return this.formsService.validatePermissions(id, user);
    }
}
