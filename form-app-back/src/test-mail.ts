// src/test-mail.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MailService } from './mail/mail.service';

async function testMail() {
    console.log('--- SMTP Connection Test ---');
    const app = await NestFactory.createApplicationContext(AppModule);
    const mailService = app.get(MailService);

    const testEmailSettings = {
        admin_email: 'ksimari@redclover.com.ar', // Cambiar si es necesario
        subject_line: 'Test SMTP Koru',
        autoresponder: false
    };

    const testData = {
        "Nombre": "Tester",
        "Mensaje": "Este es un mensaje de prueba de conexión SMTP"
    };

    const testMetadata = {
        url: 'http://localhost',
        user_agent: 'Node-Test'
    };

    try {
        console.log('Intentando enviar email...');
        const result = await mailService.sendContactEmail(testEmailSettings as any, testData, testMetadata);
        console.log('Resultado del envío:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error durante el test de mail:', error);
    } finally {
        await app.close();
    }
}

testMail();
