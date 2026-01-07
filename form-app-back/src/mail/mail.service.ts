import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailSettings } from '../forms/schemas/form.schema';
import * as sgMail from '@sendgrid/mail';
import * as net from 'net';

@Injectable()
export class MailService implements OnModuleInit {
    private readonly logger = new Logger('MailService');

    constructor(private readonly mailerService: MailerService) { }

    async onModuleInit() {
        this.logger.log('--- Iniciando Diagnóstico de Red (SendGrid) ---');

        // Configurar la API Key para el Fallback
        const apiKey = process.env.MAIL_PASS;
        if (apiKey) {
            sgMail.setApiKey(apiKey);
        }

        // Prueba de conectividad TCP al puerto 465
        const host = 'smtp.sendgrid.net';
        const port = 465;

        const socket = net.connect(port, host, () => {
            this.logger.log(`✅ [PROBE] Conexión TCP exitosa a ${host}:${port}. El puerto está ABIERTO.`);
            socket.destroy();
        });

        socket.on('error', (err) => {
            this.logger.error(`❌ [PROBE] No se pudo conectar a ${host}:${port}. Probable bloqueo de firewall: ${err.message}`);
        });

        socket.setTimeout(5000, () => {
            this.logger.warn(`⚠️ [PROBE] Timeout al intentar conectar a ${host}:${port} (5s).`);
            socket.destroy();
        });
    }

    // Función principal con Fallback SMTP -> HTTP API
    async sendContactEmail(
        emailSettings: EmailSettings,
        formData: Record<string, any>,
        metadata: Record<string, any>,
    ): Promise<any> {
        this.logger.log('[MailService] Iniciando despacho con estrategia de Fallback...');

        const clientEmail = this.extractClientEmail(formData);
        const subject = this.replaceTemplateVariables(emailSettings.subject_line, formData);

        // 1. INTENTO VÍA SMTP (Nodemailer)
        try {
            this.logger.log('[STRATEGY: SMTP] Intentando envío por puerto 465...');
            const adminMail = await this.mailerService.sendMail({
                to: emailSettings.admin_email,
                subject: `[KORU-SMTP] ${subject}`,
                replyTo: clientEmail || undefined,
                template: 'admin_notification',
                context: {
                    formData: this.formatDataForEmail(formData),
                    metadata,
                    timestamp: new Date().toLocaleString(),
                    url_origen: metadata.url || 'N/A'
                },
            });

            // Si hay autoresponder
            if (emailSettings.autoresponder && clientEmail) {
                await this.mailerService.sendMail({
                    to: clientEmail,
                    subject: 'Hemos recibido tu mensaje',
                    template: 'client_autoresponse',
                    context: {
                        clientName: formData['Nombre Completo'] || formData['Nombre'] || 'Estimado cliente',
                        success_msg: '¡Gracias! Hemos recibido tu consulta.',
                    },
                });
            }

            this.logger.log('✅ Envío exitoso vía SMTP.');
            return { success: true, method: 'SMTP', messageId: adminMail.messageId };

        } catch (smtpError: any) {
            this.logger.warn(`⚠️ Falló SMTP (${smtpError.message}). Iniciando FALLBACK a API HTTP...`);

            // 2. INTENTO VÍA API HTTP (SendGrid SDK)
            try {
                const msg = {
                    to: emailSettings.admin_email,
                    from: process.env.MAIL_FROM_EMAIL || 'noreply@redclover.com.ar', // Debe estar verificado en SG
                    replyTo: clientEmail || undefined,
                    subject: `[KORU-API] ${subject}`,
                    text: `Nuevo contacto web:\n${JSON.stringify(formData, null, 2)}`,
                    html: `<h3>Nuevo contacto web</h3><pre>${JSON.stringify(formData, null, 2)}</pre><p>Origen: ${metadata.url}</p>`,
                };

                const [response] = await sgMail.send(msg);

                // Si hay autoresponder (vía API)
                if (emailSettings.autoresponder && clientEmail) {
                    await sgMail.send({
                        to: clientEmail,
                        from: process.env.MAIL_FROM_EMAIL || 'noreply@redclover.com.ar',
                        subject: 'Hemos recibido tu mensaje',
                        text: 'Gracias por contactarnos. Te responderemos pronto.',
                        html: '<strong>¡Gracias!</strong> Hemos recibido tu consulta y te responderemos a la brevedad.',
                    });
                }

                this.logger.log('✅ Envío exitoso vía API HTTP (Puerto 443).');
                return { success: true, method: 'API_HTTP', statusCode: response.statusCode };

            } catch (apiError: any) {
                this.logger.error(`❌ Fallaron ambos métodos. Error API: ${apiError.message}`);
                return { success: false, error: apiError.message, timestamp: new Date().toISOString() };
            }
        }
    }

    private extractClientEmail(formData: Record<string, any>): string | null {
        let email = formData['Correo Electrónico'] || formData['Email'] || formData['email'] || formData['correo'];
        if (!email) {
            const key = Object.keys(formData).find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('correo'));
            if (key) email = formData[key];
        }
        return email || null;
    }

    private replaceTemplateVariables(template: string, data: Record<string, any>): string {
        let result = template;
        for (const key in data) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        }
        return result;
    }

    private formatDataForEmail(data: Record<string, any>): { key: string, value: string }[] {
        return Object.keys(data).map(key => ({ key, value: data[key] }));
    }
}
