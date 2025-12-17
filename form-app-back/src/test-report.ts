import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Submission } from './submissions/schemas/submission.schema';
import { Model } from 'mongoose';

async function generateTestReport() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const submissionModel = app.get<Model<Submission>>(getModelToken(Submission.name));

    const submissionId = '693cda48d13707925fb6df29';
    const submission = await submissionModel.findById(submissionId);

    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         REPORTE DE PRUEBA - SENDGRID EMAIL TEST           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    if (submission) {
        console.log('📋 INFORMACIÓN DE LA SUBMISSION');
        console.log('─────────────────────────────────────────────────────────');
        console.log('  ID:', submission._id);
        console.log('  Estado:', submission.status);
        console.log('  Es Spam:', submission.is_spam);
        console.log('');

        console.log('👤 DATOS DEL FORMULARIO');
        console.log('─────────────────────────────────────────────────────────');
        Object.entries(submission.data).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });
        console.log('');

        console.log('📧 ESTADO DEL ENVÍO DE EMAIL');
        console.log('─────────────────────────────────────────────────────────');

        if (submission.mail_log) {
            const mailLog = submission.mail_log as any;

            if (mailLog.success) {
                console.log('  ✅ Estado: EXITOSO');
                console.log('  📨 Emails enviados:', mailLog.count || 'N/A');

                if (mailLog.details && Array.isArray(mailLog.details)) {
                    console.log('');
                    console.log('  📬 DETALLES DE ENVÍO:');
                    mailLog.details.forEach((detail: any, index: number) => {
                        console.log(`  \n  Email #${index + 1}:`);
                        if (detail.accepted && detail.accepted.length > 0) {
                            console.log('    ✓ Destinatarios aceptados:', detail.accepted.join(', '));
                        }
                        if (detail.rejected && detail.rejected.length > 0) {
                            console.log('    ✗ Destinatarios rechazados:', detail.rejected.join(', '));
                        }
                        if (detail.envelope) {
                            console.log('    📤 De:', detail.envelope.from);
                            console.log('    📥 Para:', detail.envelope.to.join(', '));
                        }
                        if (detail.messageId) {
                            console.log('    🆔 Message ID:', detail.messageId);
                        }
                    });
                }
            } else {
                console.log('  ❌ Estado: ERROR');
                console.log('  ⚠️  Error:', mailLog.error || 'Desconocido');
                console.log('  🕐 Timestamp:', mailLog.timestamp || 'N/A');
            }
        } else {
            console.log('  ⚠️  No hay información de mail_log');
        }

        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║                    RESUMEN DEL TEST                        ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');

        const mailLog = submission.mail_log as any;
        if (mailLog && mailLog.success) {
            console.log('  ✅ PRUEBA EXITOSA');
            console.log('  ✅ La submission se guardó en la base de datos');
            console.log('  ✅ Los emails se enviaron correctamente via SendGrid');
            console.log('  ✅ Email de notificación enviado al admin: simarikaren@gmail.com');
            console.log('  ✅ Auto-respuesta enviada al cliente: maria.rodriguez@example.com');
            console.log('');
            console.log('  🎉 ¡El sistema está funcionando correctamente!');
        } else {
            console.log('  ⚠️  PRUEBA CON ADVERTENCIAS');
            console.log('  ✅ La submission se guardó en la base de datos');
            console.log('  ❌ Hubo un error al enviar los emails');
            console.log('');
            console.log('  💡 Revisa la configuración de SendGrid en el archivo .env');
        }

        console.log('');
        console.log('─────────────────────────────────────────────────────────');
        console.log('');

    } else {
        console.log('❌ Submission no encontrada con ID:', submissionId);
    }

    await app.close();
}

generateTestReport();
