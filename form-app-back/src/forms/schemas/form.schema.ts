import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// --- 1. Sub-Esquema para Configuración de Campos (A. Estructura del Formulario)
// Basado en la 'Definición del Objeto Field' [cite: 17]
@Schema({ _id: false }) // No necesitamos un ID separado para cada sub-documento
export class FieldConfig {
    @Prop({ required: true, type: String })
    id: string; // ej: "subject_select" [cite: 20]

    // Tipos: text, email, textarea, select, checkbox, number [cite: 21]
    @Prop({ required: true, enum: ['text', 'email', 'textarea', 'select', 'checkbox', 'number'] })
    type: string;

    @Prop({ required: true, type: String })
    label: string; // ej: "Motivo de contacto" [cite: 22]

    @Prop({ required: true, default: false })
    required: boolean; // [cite: 23]

    // Opciones, solo para type='select' [cite: 24]
    @Prop({ type: String, default: null })
    options: string; // ej: "Ventas, Soporte, Devoluciones"

    // Ancho: "100%" o "50%" [cite: 25]
    @Prop({ enum: ["100%", "50%"], default: "100%" })
    width: string;
}
export const FieldConfigSchema = SchemaFactory.createForClass(FieldConfig);


// --- 2. Sub-Esquema para Diseño y Comportamiento (B. Diseño y Comportamiento)
@Schema({ _id: false })
export class LayoutSettings {
    // Modo Visual: Inline, Floating, Popup [cite: 28]
    @Prop({ enum: ['Inline', 'Floating', 'Popup'], default: 'Inline' })
    display_type: string;

    @Prop({ enum: ['Bottom-Right', 'Bottom-Left'], default: 'Bottom-Right' })
    position: string; // Posición Flotante [cite: 28]

    @Prop({ enum: ['Envelope', 'Chat', 'User', 'Question'], default: 'Envelope' })
    bubble_icon: string; // Icono Burbuja [cite: 28]

    @Prop({ type: String, default: '#00C896' })
    accent_color: string; // Color Principal [cite: 28]

    @Prop({ type: String, default: 'Enviar Mensaje' })
    submit_text: string; // Texto del Botón [cite: 16]

    @Prop({ type: String, default: '¡Gracias! Te responderemos pronto.' })
    success_msg: string; // Mensaje de Éxito [cite: 16]

    @Prop({ type: String, default: null })
    redirect_url: string; // URL de Redirección [cite: 16]
}
export const LayoutSettingsSchema = SchemaFactory.createForClass(LayoutSettings);


// --- 3. Sub-Esquema para Configuración de Correo (C. Configuración de Correo)
@Schema({ _id: false })
export class EmailSettings {
    @Prop({ required: true, type: String })
    admin_email: string; // Destinatario dónde llegan los mensajes [cite: 30]

    @Prop({ type: String, default: "Nuevo contacto web: {{Name}}" })
    subject_line: string; // Asunto del Mail [cite: 30]

    @Prop({ default: true })
    autoresponder: boolean; // Toggle ON/OFF para auto-respuesta al cliente [cite: 30]
}
export const EmailSettingsSchema = SchemaFactory.createForClass(EmailSettings);


// ===============================================
// 4. Esquema Principal: FORM
// ===============================================
export type FormDocument = HydratedDocument<Form>;

@Schema({ timestamps: true, collection: 'forms' })
export class Form {
    // Referencia al dueño del formulario (Administrador). Referencia a la colección 'users'.
    // EN KORU SUITE, la propiedad principal es 'website_id', el 'owner_id' es legacy o auxiliar.
    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    owner_id?: Types.ObjectId;

    @Prop({ required: true, type: String })
    title: string;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ enum: ['active', 'inactive', 'draft'], default: 'draft' })
    status: string;

    // A. Estructura del Formulario: Lista de campos dinámicos
    @Prop({ type: [FieldConfigSchema], required: true })
    fields_config: FieldConfig[]; // 'fields_config' es una lista de objetos que define qué inputs mostrar. [cite: 14, 15]

    // B. Diseño y Comportamiento
    @Prop({ type: LayoutSettingsSchema, required: true })
    layout_settings: LayoutSettings;

    // C. Configuración de Correo
    @Prop({ type: EmailSettingsSchema, required: true })
    email_settings: EmailSettings;

    // Campo de seguridad para la Fase 2 o para identificar la aplicación
    @Prop({ type: String, unique: true, required: true })
    formId: string; // ej: "koru-form-123" [cite: 36]

    @Prop({ type: String, required: false })
    token?: string; // JWT token para visualización/alta desde el frontend

    @Prop({ type: String, required: false, index: true })
    website_id?: string; // Website ID asociado. Indexado para búsquedas rápidas.
}

export const FormSchema = SchemaFactory.createForClass(Form);
