import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Submission } from './submissions/schemas/submission.schema';
import { Model } from 'mongoose';

async function checkEmailDetails() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const submissionModel = app.get<Model<Submission>>(getModelToken(Submission.name));

    const submissionId = '693ce01be3f3cfd18a204621';
    const submission = await submissionModel.findById(submissionId);

    if (submission && submission.mail_log) {
        const mailLog = submission.mail_log as any;

        console.log('\n========================================');
        console.log('DETALLES DEL ENVÍO DE EMAILS');
        console.log('========================================\n');

        console.log('Estado general:', mailLog.success ? '✅ EXITOSO' : '❌ ERROR');
        console.log('Cantidad de emails:', mailLog.count);
        console.log('');

        if (mailLog.details && Array.isArray(mailLog.details)) {
            mailLog.details.forEach((detail: any, index: number) => {
                console.log(`\n--- Email #${index + 1} ---`);

                if (detail.envelope) {
                    console.log('De:', detail.envelope.from);
                    console.log('Para:', detail.envelope.to);
                }

                if (detail.accepted && detail.accepted.length > 0) {
                    console.log('✅ Aceptados:', detail.accepted.join(', '));
                }

                if (detail.rejected && detail.rejected.length > 0) {
                    console.log('❌ Rechazados:', detail.rejected.join(', '));
                }

                if (detail.response) {
                    console.log('Respuesta:', detail.response);
                }

                if (detail.messageId) {
                    console.log('Message ID:', detail.messageId);
                }
            });
        }

        console.log('\n========================================\n');

        // Análisis
        if (mailLog.count === 2) {
            console.log('✅ Se enviaron 2 emails como esperado');
            console.log('   1. Notificación al admin');
            console.log('   2. Auto-respuesta al cliente');
            console.log('\n💡 Si no recibiste la auto-respuesta en simarikaren@gmail.com:');
            console.log('   - Revisa la carpeta de SPAM');
            console.log('   - Puede tardar unos minutos en llegar');
            console.log('   - Verifica que el email no esté bloqueado por Gmail');
        } else {
            console.log('⚠️  Solo se envió', mailLog.count, 'email(s)');
        }

    } else {
        console.log('❌ No se encontró información de mail_log');
    }

    await app.close();
}

checkEmailDetails();
