import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailSettings } from '../forms/schemas/form.schema';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) { }

    // Función principal que el SubmissionsService llamará
    async sendContactEmail(
        emailSettings: EmailSettings,
        formData: Record<string, any>,
        metadata: Record<string, any>,
    ): Promise<any> {

        console.log('[MailService] Iniciando envío de email...');
        console.log('[MailService] Admin Email:', emailSettings.admin_email);
        console.log('[MailService] Autoresponder:', emailSettings.autoresponder);

        const mailPromises: Promise<any>[] = [];

        try {
            // --- 1. Preparación de Variables ---
            // Extraemos el email del cliente - intentamos varias variaciones del nombre del campo
            let clientEmail = formData['Correo Electrónico']
                || formData['Correo Electronico']
                || formData['Email']
                || formData['email']
                || formData['correo']
                || null;

            // Log para debugging
            console.log('[MailService] Campos del formulario:', Object.keys(formData));
            console.log('[MailService] Buscando email del cliente...');

            // Si no encontramos el email, intentamos buscar cualquier campo que contenga "email" o "correo"
            if (!clientEmail) {
                const emailField = Object.keys(formData).find(key =>
                    key.toLowerCase().includes('email') ||
                    key.toLowerCase().includes('correo') ||
                    key.toLowerCase().includes('electr')
                );
                if (emailField) {
                    clientEmail = formData[emailField];
                    console.log(`[MailService] Email encontrado en campo: "${emailField}"`);
                }
            }

            // Reemplazo del Título Dinámico: ej. "Nuevo contacto web: {{Name}}"
            const subject = this.replaceTemplateVariables(emailSettings.subject_line, formData);

            console.log('[MailService] Subject:', subject);
            console.log('[MailService] Client Email:', clientEmail);

            // --- 2. Envío al Administrador (Notificación) ---
            console.log('[MailService] Preparando email al administrador...');
            mailPromises.push(
                this.mailerService.sendMail({
                    to: emailSettings.admin_email,
                    subject: `[KORU] ${subject}`,
                    // Establece el email del cliente como Reply-To para que el admin responda directamente
                    replyTo: clientEmail,
                    // Usamos la plantilla 'admin_notification' para listar las respuestas
                    template: 'admin_notification',
                    context: {
                        formData: this.formatDataForEmail(formData), // Datos formateados para la tabla
                        metadata: metadata,
                        timestamp: new Date().toLocaleString(),
                        // Agrega el enlace a la URL de origen (Requerimiento de QA)
                        url_origen: metadata.url || 'N/A'
                    },
                }).catch(error => {
                    console.error('[MailService] Error enviando email al admin:', error.message);
                    throw error;
                }),
            );

            // --- 3. Auto-Respuesta al Cliente (Si está activada) ---
            console.log('[MailService] ===== VERIFICACIÓN AUTO-RESPUESTA =====');
            console.log('[MailService] Autoresponder activado?:', emailSettings.autoresponder);
            console.log('[MailService] Client Email detectado?:', clientEmail);
            console.log('[MailService] Tipo de clientEmail:', typeof clientEmail);

            if (emailSettings.autoresponder && clientEmail) {
                console.log('[MailService] ✅ Preparando auto-respuesta al cliente...');
                mailPromises.push(
                    this.mailerService.sendMail({
                        to: clientEmail,
                        subject: 'Hemos recibido tu mensaje',
                        // Usamos la plantilla 'client_autoresponse'
                        template: 'client_autoresponse',
                        context: {
                            clientName: formData['Nombre Completo'] || 'Estimado cliente',
                            success_msg: '¡Gracias! Te responderemos pronto.', // Se podría traer de LayoutSettings
                        },
                    }).catch(error => {
                        console.error('[MailService] Error enviando auto-respuesta:', error.message);
                        throw error;
                    }),
                );
            }

            // Ejecutar todos los envíos en paralelo
            console.log('[MailService] Enviando emails...');
            const results = await Promise.all(mailPromises);
            console.log('[MailService] ✅ Emails enviados exitosamente:', results.length);
            return { success: true, count: results.length, details: results };

        } catch (error) {
            console.error('[MailService] ❌ Error crítico en envío de email:', error);
            console.error('[MailService] Error stack:', error.stack);

            // Devolver el error para que SubmissionsService lo guarde en mail_log
            return {
                success: false,
                error: error.message,
                errorType: error.name,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Método auxiliar para reemplazar {{variables}} en la cadena
    private replaceTemplateVariables(template: string, data: Record<string, any>): string {
        let result = template;
        for (const key in data) {
            // Reemplaza {{Nombre Completo}} con el valor correspondiente
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        }
        return result;
    }

    // Método auxiliar para transformar el objeto JSON plano en un array para Handlebars (mejor renderizado en HTML)
    private formatDataForEmail(data: Record<string, any>): { key: string, value: string }[] {
        return Object.keys(data).map(key => ({
            key,
            value: data[key]
        }));
    }
}
