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
    // EN KORU SUITE: 'ownerId' se reemplaza conceptualmente por 'websiteId'
    async create(createFormDto: CreateFormDto, websiteId?: string): Promise<Form> {
        const existingForm = await this.formModel.findOne({ formId: createFormDto.formId }).exec();
        if (existingForm) {
            throw new ConflictException(`Ya existe un formulario con el APP ID: ${createFormDto.formId}`);
        }

        if (!websiteId) {
            throw new BadRequestException('No se pudo determinar el sitio web autorizado para crear el formulario.');
        }

        const token = this.jwtService.sign({
            formId: createFormDto.formId,
            title: createFormDto.title,
            website_id: websiteId, // Ahora el token va ligado al Website
        });

        const createdForm = new this.formModel({
            ...createFormDto,
            name: createFormDto.title,
            // owner_id: Ahora es opcional y no lo forzamos si no es ObjectId válido
            website_id: websiteId, // Guardamos la relación crítica para el multi-tenant
            status: 'draft',
            token,
        });

        return createdForm.save();
    }

    // 2. READ ALL: Obtener formularios filtrados por sitios autorizados (Multi-tenant)
    async findAll(authorizedWebsites?: string[]): Promise<Form[]> {
        const query: any = {};
        if (authorizedWebsites) {
            query.website_id = { $in: authorizedWebsites };
        }
        return this.formModel.find(query).exec();
    }

    // 3. READ ONE: Obtener un formulario específico
    async findOne(formId: string, authorizedWebsites?: string[]): Promise<Form> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const query: any = { _id: formId };
        if (authorizedWebsites) {
            query.website_id = { $in: authorizedWebsites };
        }

        const form = await this.formModel.findOne(query).exec();
        if (!form) {
            throw new NotFoundException(`Formulario no encontrado o acceso denegado.`);
        }
        return form;
    }

    // 4. CONFIG: Obtener configuración pública para el widget (Público pero con validación de sitio)
    async getFormConfig(formId: string, websiteId: string): Promise<Form> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const form = await this.formModel.findOne({
            _id: formId,
            status: 'active'
        }).exec();

        if (!form) {
            throw new NotFoundException('El formulario no está activo o no existe.');
        }

        if ((form as any).website_id !== websiteId) {
            throw new ForbiddenException('Este sitio no está autorizado para este formulario.');
        }

        return form;
    }

    // 5. UPDATE: Actualizar un formulario
    async update(formId: string, updateFormDto: UpdateFormDto, authorizedWebsites?: string[]): Promise<Form> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const query: any = { _id: formId };
        if (authorizedWebsites) {
            query.website_id = { $in: authorizedWebsites };
        }

        const currentForm = await this.formModel.findOne(query).exec();
        if (!currentForm) {
            throw new NotFoundException(`Formulario no encontrado o acceso denegado.`);
        }

        const updatedForm = await this.formModel.findOneAndUpdate(
            query,
            updateFormDto,
            { new: true }
        ).exec();

        if (!updatedForm) {
            throw new InternalServerErrorException(`Error al actualizar el formulario.`);
        }

        return updatedForm;
    }

    // 6. DELETE: Eliminar un formulario
    async remove(formId: string, authorizedWebsites?: string[]): Promise<any> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const query: any = { _id: formId };
        if (authorizedWebsites) {
            query.website_id = { $in: authorizedWebsites };
        }

        const result = await this.formModel.deleteOne(query).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(`Formulario no encontrado o acceso denegado.`);
        }
        return { deleted: true, formId };
    }

    // 7. ACTIVATE: Validar con Koru Suite y activar en MongoDB
    async activate(formId: string, websiteId: string, koruToken: string): Promise<Form> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const form = await this.formModel.findById(formId).exec();
        if (!form) {
            throw new NotFoundException(`Formulario no encontrado.`);
        }

        try {
            const KORU_API_URL = this.configService.get('KORU_API_URL') || 'https://www.korusuite.com/api';
            const response = await firstValueFrom(
                this.httpService.get(`${KORU_API_URL}/websites/${websiteId}`, {
                    headers: { Authorization: `Bearer ${koruToken}` }
                })
            );

            const websiteData = response.data;
            const isInstalled = websiteData.apps?.some((app: any) => app.appId === this.KORU_APP_ID || app.id === this.KORU_APP_ID);

            if (!isInstalled) {
                throw new ForbiddenException('La App Koru Contact Form no está instalada en este sitio.');
            }
        } catch (error) {
            if (error instanceof ForbiddenException) throw error;
            const status = error.response?.status;
            if (status === 401) throw new UnauthorizedException('Token de Koru Suite inválido.');
            if (status === 403) throw new ForbiddenException('No tienes permisos sobre este website.');
            throw new BadRequestException(error.response?.data?.message || 'Error al validar con Koru Suite');
        }

        form.status = 'active';
        (form as any).website_id = websiteId;
        return form.save();
    }

    // 8. TRIPLE CHECK: Validación avanzada para el dashboard
    async validatePermissions(formId: string, koruUser: any): Promise<{ authorized: boolean }> {
        if (!Types.ObjectId.isValid(formId)) {
            throw new BadRequestException('ID de formulario inválido.');
        }

        const form = await this.formModel.findById(formId).exec();
        if (!form) {
            throw new NotFoundException(`Formulario no encontrado.`);
        }

        if (form.status !== 'active') {
            throw new ForbiddenException('El formulario debe estar activado para generar su embed code.');
        }

        const websiteId = (form as any).website_id;
        if (!websiteId) {
            throw new ForbiddenException('El formulario no ha sido activado para ningún sitio.');
        }

        const authorizedWebsites = koruUser.websites || [];
        const isAuthorized = authorizedWebsites.includes(websiteId);

        if (!isAuthorized) {
            throw new ForbiddenException('No tienes permisos sobre el sitio vinculado a este formulario.');
        }

        return { authorized: true };
    }
}
