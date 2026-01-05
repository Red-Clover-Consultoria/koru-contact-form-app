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
        // Obtenemos los sitios permitidos desde el token decodificado
        const userWebsites = req.user?.websites || [];

        // 1. Prioridad: websiteId que viene en el DTO (si el usuario eligió uno específico)
        // 2. Fallback: el primer sitio de su lista (si solo tiene uno o no envió nada)
        const targetWebsiteId = createFormDto.websiteId || userWebsites[0];

        if (!targetWebsiteId) {
            // Caso borde: usuario logueado en Koru pero sin ningún website asignado
            throw new BadRequestException('Tu usuario no tiene sitios web autorizados en Koru Suite.');
        }

        // Validación de Seguridad: ¿El sitio objetivo está en la lista de permitidos del usuario?
        if (!userWebsites.includes(targetWebsiteId)) {
            throw new ForbiddenException(`No tienes permisos para crear formularios en el sitio: ${targetWebsiteId}`);
        }


        return this.formsService.create(createFormDto, targetWebsiteId);
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
        const formConfig = await this.formsService.getFormConfig(id, websiteId);
        console.log('SENDING_TO_WIDGET:', formConfig?.fields_config);
        return formConfig;
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

    // Compatibilidad con Koru SDK
    @Post('validate-website')
    async validateWebsite(@Body('websiteId') websiteId: string) {
        // Por ahora retornamos éxito si se provee el ID. 
        // El SDK requiere este endpoint para confirmar que el App Provider está vivo.
        console.log(`[Compatibility] Validation request for website: ${websiteId}`);
        return { authorized: true, websiteId };
    }
}
