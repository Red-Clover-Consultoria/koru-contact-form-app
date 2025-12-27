import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema({ timestamps: true, collection: 'form_submissions' })
export class Submission {
    // Referencia al formulario al que pertenece el envío
    @Prop({ type: Types.ObjectId, ref: 'Form', required: true })
    form_id: Types.ObjectId;

    // ID del sitio web para facilitar la búsqueda
    @Prop({ type: String, required: true })
    website_id: string;

    // ID de la aplicación que realiza el envío
    @Prop({ type: String, required: false })
    app_id?: string;

    // Objeto que contiene las respuestas (par clave-valor)
    @Prop({ type: Object, required: true })
    data: Record<string, any>;

    // Objeto que contiene los metadatos (url, user_agent, etc.)
    @Prop({ type: Object, required: true })
    metadata: Record<string, any>;

    // Status para la administración (para que el admin sepa qué ha revisado)
    @Prop({ enum: ['unread', 'read', 'archived'], default: 'unread' })
    status: string;

    // Puntuación o flag para indicar si fue un intento de spam
    @Prop({ type: Boolean, default: false })
    is_spam: boolean;

    // Campo que almacena el resultado del servicio de correo (éxito/fallo)
    @Prop({ type: Object, default: null })
    mail_log: Record<string, any>;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
