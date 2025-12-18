// src/forms/forms.service.ts

import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Form } from './schemas/form.schema';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { User } from '../auth/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class FormsService {
    constructor(
        @InjectModel(Form.name) private formModel: Model<Form>,
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    // 1. CREATE: Crear un nuevo formulario
    //
    // MODO DEV (sin auth):
    //  - Si no se provee ownerId, se usa un usuario cliente de pruebas como dueño por defecto.
    // MODO PROD (con auth de Koru):
    //  - Pasar ownerId explícito desde el JWT (req.user.id) para respetar el multi-tenant.
    async create(createFormDto: CreateFormDto, ownerId?: string): Promise<Form> {
        // Prevenir duplicación de app_id
        const existingForm = await this.formModel.findOne({ app_id: createFormDto.app_id }).exec();
        if (existingForm) {
            throw new ConflictException(`Ya existe un formulario con el APP ID: ${createFormDto.app_id}`);
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
            app_id: createFormDto.app_id,
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

    // 4. READ ONE (Frontend Widget): Obtener configuración por App ID (Público)
    async findConfigByAppId(appId: string): Promise<Form> {
        const form = await this.formModel.findOne({
            app_id: appId,
            status: { $in: ['active', 'draft'] }
        }).select('fields_config layout_settings email_settings token').exec();

        if (!form) {
            throw new NotFoundException(`Configuración de formulario ${appId} no encontrada o inactiva.`);
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
                app_id: currentForm.app_id,
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
}
