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
        console.log('[MailService] Host configurado:', process.env.MAIL_HOST);
        console.log('[MailService] Port configurado:', process.env.MAIL_PORT);
        console.log('[MailService] Admin Email (Destino):', emailSettings.admin_email);

        try {
            // --- 1. Preparación de Variables ---
            // Extraemos el email del cliente para el Reply-To dinámico
            let clientEmail = formData['Correo Electrónico']
                || formData['Correo Electronico']
                || formData['Email']
                || formData['email']
                || formData['correo']
                || null;

            if (!clientEmail) {
                const emailField = Object.keys(formData).find(key =>
                    key.toLowerCase().includes('email') ||
                    key.toLowerCase().includes('correo') ||
                    key.toLowerCase().includes('electr')
                );
                if (emailField) {
                    clientEmail = formData[emailField];
                }
            }

            // Reemplazo del Título Dinámico: ej. "Nuevo contacto web: {{Name}}"
            const subject = this.replaceTemplateVariables(emailSettings.subject_line, formData);

            // --- 2. Envío al Administrador (Notificación con Reply-To dinámico) ---
            console.log('[MailService] Enviando notificación al administrador...');
            const adminMail = await this.mailerService.sendMail({
                to: emailSettings.admin_email,
                subject: `[KORU] ${subject}`,
                replyTo: clientEmail || undefined, // CRITICAL: Permite responder directamente al cliente
                template: 'admin_notification',
                context: {
                    formData: this.formatDataForEmail(formData),
                    metadata: metadata,
                    timestamp: new Date().toLocaleString(),
                    url_origen: metadata.url || 'N/A'
                },
            });

            // --- 3. Auto-Respuesta al Cliente (Si está activada) ---
            let clientMail: any = null;
            if (emailSettings.autoresponder && clientEmail) {
                console.log('[MailService] Enviando auto-respuesta al cliente:', clientEmail);
                clientMail = await this.mailerService.sendMail({
                    to: clientEmail,
                    subject: 'Hemos recibido tu mensaje',
                    template: 'client_autoresponse',
                    context: {
                        clientName: formData['Nombre Completo'] || formData['Nombre'] || 'Estimado cliente',
                        success_msg: '¡Gracias! Hemos recibido tu consulta y te responderemos a la brevedad.',
                    },
                });
            }

            return {
                success: true,
                adminMailId: adminMail.messageId,
                clientMailId: clientMail?.messageId || null
            };

        } catch (error: any) {
            console.error('[MailService] ❌ Error crítico en envío de email:', error.message);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Método auxiliar para reemplazar {{variables}} en la cadena
    private replaceTemplateVariables(template: string, data: Record<string, any>): string {
        let result = template;
        for (const key in data) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        }
        return result;
    }

    // Método auxiliar para transformar el objeto JSON plano en un array para Handlebars
    private formatDataForEmail(data: Record<string, any>): { key: string, value: string }[] {
        return Object.keys(data).map(key => ({
            key,
            value: data[key]
        }));
    }
}
