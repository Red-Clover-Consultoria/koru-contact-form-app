// src/forms/forms.service.ts

import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Form } from './schemas/form.schema';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { User } from '../auth/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class FormsService {
    constructor(
        @InjectModel(Form.name) private formModel: Model<Form>,
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    private get KORU_APP_ID() {
        return this.configService.get<string>('KORU_APP_ID') || '7fd1463d-cd54-420d-afc0-c874879270cf';
    }

    // 1. CREATE: Crear un nuevo formulario
    //
    // MODO DEV (sin auth):
    //  - Si no se provee ownerId, se usa un usuario cliente de pruebas como dueño por defecto.
    // MODO PROD (con auth de Koru):
    //  - Pasar ownerId explícito desde el JWT (req.user.id) para respetar el multi-tenant.
    async create(createFormDto: CreateFormDto, ownerId?: string): Promise<Form> {
        // Prevenir duplicación de form_id
        const existingForm = await this.formModel.findOne({ formId: createFormDto.formId }).exec();
        if (existingForm) {
            throw new ConflictException(`Ya existe un formulario con el APP ID: ${createFormDto.formId}`);
        }

        // Resolver el owner efectivo
        let effectiveOwnerId: string | undefined = ownerId;

        if (!effectiveOwnerId) {
            // DEV MODE: buscamos un usuario cliente de pruebas
            const devClientEmail = process.env.KORU_DEV_CLIENT_EMAIL || 'simarikaren@gmail.com';
            const clientUser = await this.userModel.findOne({ email: devClientEmail }).exec();

            if (!clientUser) {
                throw new InternalServerErrorException(
                    `No se encontró el usuario cliente de desarrollo con email ${devClientEmail}. ` +
                    `Ejecuta el seed o ajusta la variable de entorno KORU_DEV_CLIENT_EMAIL.`,
                );
            }
            effectiveOwnerId = clientUser._id.toString();
        }

        // Generar un token JWT para el formulario
        // Este token puede ser usado por el frontend para validar el "alta" o visualización.
        const token = this.jwtService.sign({
            formId: createFormDto.formId,
            title: createFormDto.title,
            owner_id: effectiveOwnerId,
        });

        const createdForm = new this.formModel({
            ...createFormDto,
            // Nombre interno del formulario: por ahora usamos el mismo título.
            // Más adelante se podría generar un slug o permitir configurarlo aparte.
            name: createFormDto.title,
            owner_id: new Types.ObjectId(effectiveOwnerId), // ID del dueño del formulario
            status: 'draft', // Empieza como borrador
            token, // Guardamos el token generado
        });

        return createdForm.save();
    }

    // 2. READ ALL: Obtener todos los formularios
    // Si se pasa ownerId, filtra por ese usuario (para Clientes o Admin filtrando)
    // Si no se pasa ownerId (null/undefined), devuelve TODO (Solo para Admin)
    async findAll(ownerId?: string): Promise<Form[]> {
        const query = ownerId ? { owner_id: new Types.ObjectId(ownerId) } : {};
        return this.formModel.find(query).exec();
    }

    // 3. READ ONE: Obtener un formulario por ID
    // Si se pasa ownerId, verifica propiedad. Si no, asume Admin y solo busca por ID.
    async findOne(formId: string, ownerId?: string): Promise<Form> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const query: any = { _id: formId };
        if (ownerId) {
            query.owner_id = new Types.ObjectId(ownerId);
        }

        const form = await this.formModel.findOne(query).exec();

        if (!form) {
            throw new NotFoundException(`Formulario con ID ${formId} no encontrado o acceso denegado.`);
        }
        return form;
    }

    // 4. READ ONE (Frontend Widget): Obtener configuración por Form ID (Público)
    async findConfigByFormId(formId: string): Promise<Form> {
        const form = await this.formModel.findOne({
            formId: formId,
            status: { $in: ['active', 'draft'] }
        }).select('fields_config layout_settings email_settings token').exec();

        if (!form) {
            throw new NotFoundException(`Configuración de formulario ${formId} no encontrada o inactiva.`);
        }
        return form;
    }

    // 5. UPDATE: Actualizar un formulario
    async update(formId: string, updateFormDto: UpdateFormDto, ownerId?: string): Promise<Form> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const query: any = { _id: formId };
        if (ownerId) {
            query.owner_id = new Types.ObjectId(ownerId);
        }

        // Obtener el formulario actual para ver si ya tiene token
        const currentForm = await this.formModel.findOne(query).exec();
        if (!currentForm) {
            throw new NotFoundException(`Formulario con ID ${formId} no encontrado o acceso denegado.`);
        }

        // Si no tiene token, lo generamos
        if (!currentForm.token) {
            (updateFormDto as any).token = this.jwtService.sign({
                formId: currentForm.formId,
                title: currentForm.title,
                owner_id: currentForm.owner_id.toString(),
            });
        }

        const updatedForm = await this.formModel.findOneAndUpdate(
            query,
            updateFormDto,
            { new: true } // Devuelve el documento actualizado
        ).exec();

        if (!updatedForm) {
            throw new InternalServerErrorException(`Error al actualizar el formulario con ID ${formId}.`);
        }

        return updatedForm;
    }

    // 6. DELETE: Eliminar un formulario
    async remove(formId: string, ownerId?: string): Promise<any> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const query: any = { _id: formId };
        if (ownerId) {
            query.owner_id = new Types.ObjectId(ownerId);
        }

        const result = await this.formModel.deleteOne(query).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(`Formulario con ID ${formId} no encontrado o acceso denegado.`);
        }
        return { deleted: true, formId };
    }

    // 7. ACTIVATE: Validar con Koru Suite y activar en MongoDB
    async activate(formId: string, websiteId: string, koruToken: string): Promise<Form> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        // 1. Verificar si el formulario existe
        const form = await this.formModel.findById(formId).exec();
        if (!form) {
            throw new NotFoundException(`Formulario no encontrado.`);
        }

        // 2. Consultar a Koru Suite si la App está habilitada para el website_id
        try {
            const KORU_API_URL = process.env.KORU_API_URL || 'https://www.korusuite.com/api';
            const response = await firstValueFrom(
                this.httpService.get(`${KORU_API_URL}/websites/${websiteId}`, {
                    headers: { Authorization: `Bearer ${koruToken}` }
                })
            );

            const websiteData = response.data;
            // Confirmamos que nuestra APP_ID está vinculada a ese sitio
            const isInstalled = websiteData.apps?.some((app: any) => app.appId === this.KORU_APP_ID || app.id === this.KORU_APP_ID);

            if (!isInstalled) {
                throw new ForbiddenException('La App Koru Contact Form no está instalada en este sitio.');
            }
        } catch (error) {
            if (error instanceof ForbiddenException) throw error;

            const status = error.response?.status;
            if (status === 401) throw new UnauthorizedException('Token de Koru Suite inválido.');
            if (status === 403) throw new ForbiddenException('No tienes permisos sobre este website.');

            throw new BadRequestException(
                error.response?.data?.message || 'Error al validar con Koru Suite'
            );
        }

        // 3. Actualizar estado y website_id en MongoDB
        form.status = 'active';
        (form as any).website_id = websiteId;
        return form.save();
    }

    async getFormConfig(formId: string, websiteId: string): Promise<Form> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const form = await this.formModel.findOne({
            _id: formId,
            status: 'active'
        }).exec();

        if (!form) {
            console.error(`[FormsService] Config requested for inactive or missing form: ${formId}`);
            throw new NotFoundException('El formulario no está activo o no existe.');
        }

        // Validación de Dominio/Propiedad
        if ((form as any).website_id !== websiteId) {
            console.error(`[FormsService] Domain mismatch: Found ${form.website_id}, requested ${websiteId}`);
            throw new ForbiddenException('Este sitio no está autorizado para mostrar este formulario.');
        }

        return form;
    }

    async validatePermissions(formId: string, koruUser: any): Promise<{ authorized: boolean }> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const form = await this.formModel.findById(formId).exec();
        if (!form) {
            throw new NotFoundException(`Formulario no encontrado.`);
        }

        // Check 1: Form MUST be active
        if (form.status !== 'active') {
            throw new ForbiddenException('El formulario debe estar activado para generar su embed code.');
        }

        const websiteId = (form as any).website_id;
        if (!websiteId) {
            throw new ForbiddenException('El formulario no ha sido activado para ningún sitio.');
        }

        // Check 2: User must manage the website linked to this form
        // (Token validity is checked by KoruAuthMiddleware - Check 3)
        const authorizedWebsites = koruUser.websites || [];
        const isAuthorized = authorizedWebsites.includes(websiteId);

        if (!isAuthorized) {
            throw new ForbiddenException('No tienes permisos sobre el sitio vinculado a este formulario.');
        }

        return { authorized: true };
    }
}
