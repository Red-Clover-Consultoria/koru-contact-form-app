import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SubmitFormDto } from './dto/submit-form.dto';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { Form } from '../forms/schemas/form.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SubmissionsService {
    // Inyección de los modelos de MongoDB
    constructor(
        @InjectModel(Submission.name) private submissionModel: Model<Submission>,
        @InjectModel(Form.name) private formModel: Model<Form>,
        private mailService: MailService,
    ) { }

    async processSubmission(payload: SubmitFormDto): Promise<SubmissionDocument> {
        console.log('[SubmissionsService] Procesando nueva submission...');
        console.log('[SubmissionsService] FORM ID:', payload.formId);
        console.log('[SubmissionsService] APP ID:', payload.app_id);

        // 1. Verificar la Existencia y Estado del Formulario
        const formConfig = await this.formModel.findOne({
            formId: payload.formId,
            status: { $in: ['active', 'draft'] }
        }).exec();

        if (!formConfig) {
            console.error('[SubmissionsService] ❌ Formulario no encontrado:', payload.formId);
            throw new NotFoundException(`Formulario con APP ID ${payload.formId} no encontrado o inactivo.`);
        }

        console.log('[SubmissionsService] ✅ Formulario encontrado:', formConfig.name);

        // 2. Validación de Spam (Honeypot) - Punto 4.2 (Validación de Spam)
        // Verificar campo oculto honeypot (si tiene valor, es un bot -> descartar silenciosamente) [cite: 50]
        const isSpam = payload.metadata._trap && payload.metadata._trap.length > 0;

        if (isSpam) {
            // Registrar el intento de spam y descartar el correo, pero devolver 200 OK para no alertar al bot 
            console.log(`[SubmissionsService] 🚫 SPAM DETECTADO para el formulario ${payload.formId}`);

            // Creamos la entrada como spam para logging interno, sin devolver error al cliente
            const spamEntry = new this.submissionModel({
                form_id: formConfig._id,
                website_id: payload.website_id,
                app_id: payload.app_id,
                data: payload.data,
                metadata: payload.metadata,
                status: 'archived',
                is_spam: true
            });
            await spamEntry.save();

            // Lógica silenciosa: devolvemos una respuesta de éxito simulada
            throw new BadRequestException('Success (Filtered by spam)');
        }

        // 3. Persistencia - Guardar en MongoDB colección form_submissions 
        console.log('[SubmissionsService] Guardando submission en base de datos...');
        const newSubmission = new this.submissionModel({
            form_id: formConfig._id,
            website_id: payload.website_id,
            app_id: payload.app_id,
            data: payload.data,
            metadata: payload.metadata,
            status: 'unread',
            is_spam: false
        });

        const savedSubmission = await newSubmission.save();
        console.log('[SubmissionsService] ✅ Submission guardada con ID:', savedSubmission._id);

        // 4. Despacho (Mailer) - FIRE AND FORGET (Asíncrono)
        // No esperamos al mailer para responder al cliente (evita timeout en el widget)
        console.log('[SubmissionsService] Iniciando despacho de email asíncrono...');

        this.mailService.sendContactEmail(
            formConfig.email_settings,
            payload.data,
            payload.metadata
        ).then(async (mailResult) => {
            // Actualizamos la submission una vez termine el mailer (en segundo plano)
            const submission = await this.submissionModel.findById(savedSubmission._id);
            if (submission) {
                submission.mail_log = mailResult;
                await submission.save();
                console.log(`[SubmissionsService] Mail_log actualizado para ${savedSubmission._id}:`, mailResult.success ? 'Success' : 'Failed');
            }
        }).catch(async (error) => {
            console.error('[SubmissionsService] Error fatal en despacho asíncrono:', error.message);
            const submission = await this.submissionModel.findById(savedSubmission._id);
            if (submission) {
                submission.mail_log = {
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
                await submission.save();
            }
        });

        return savedSubmission;
    }
}
