// src/test-simple.ts
// Script de prueba simple - escribe a archivo log
// Ejecutar con: npx ts-node src/test-simple.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FormsService } from './forms/forms.service';
import { AuthService } from './auth/auth.service';
import * as fs from 'fs';

const logFile = 'test-output.log';

function log(message: string) {
    const line = `${new Date().toISOString()} | ${message}`;
    console.log(line);
    fs.appendFileSync(logFile, line + '\n');
}

async function testSimple() {
    // Limpiar log anterior
    fs.writeFileSync(logFile, '');

    log('=== INICIO TEST KORU SUITE ===');

    const app = await NestFactory.createApplicationContext(AppModule);
    const formsService = app.get(FormsService);
    const authService = app.get(AuthService);

    try {
        // 1. LOGIN
        log('PASO 1: Intentando login...');

        const loginDto = {
            username: 'ksimari@redclover.com.ar',
            password: 'test1234!'
        };

        try {
            const result = await authService.login(loginDto);
            log('LOGIN OK - Email: ' + result.user.email);
            log('Websites: ' + JSON.stringify(result.user.websites));

            if (result.user.websites && result.user.websites.length > 0) {
                const websiteId = result.user.websites[0];
                log('PASO 2: Validando websiteId: ' + websiteId);

                // Crear formulario de prueba
                const testForm = {
                    formId: `test-${Date.now()}`,
                    title: 'Test Form',
                    fields_config: [{ id: 'name', type: 'text', label: 'Nombre', required: true, width: '100%' }],
                    layout_settings: { display_type: 'Inline', position: 'Bottom-Right', bubble_icon: 'Envelope', accent_color: '#00C896', submit_text: 'Enviar', success_msg: 'OK' },
                    email_settings: { admin_email: 'test@test.com', subject_line: 'Test', autoresponder: false }
                };

                try {
                    const created = await formsService.create(testForm as any, websiteId);
                    log('FORM CREADO OK - ID: ' + (created as any)._id);
                    log('isActive: ' + created.isActive);

                    // Eliminar
                    await (formsService as any).formModel.deleteOne({ _id: (created as any)._id });
                    log('Form eliminado');
                } catch (e: any) {
                    log('ERROR crear form: ' + e.message);
                }
            }
        } catch (e: any) {
            log('ERROR login: ' + e.message);
            log('Status: ' + e.response?.status);
            log('Data: ' + JSON.stringify(e.response?.data));
        }

        // 3. CRON
        log('PASO 3: Ejecutando Cron...');
        await formsService.handleCron();
        log('Cron completado');

        // 4. Stats
        const active = await (formsService as any).formModel.countDocuments({ isActive: true });
        const inactive = await (formsService as any).formModel.countDocuments({ isActive: false });
        log('Formularios activos: ' + active);
        log('Formularios inactivos: ' + inactive);

    } catch (error: any) {
        log('ERROR GENERAL: ' + error.message);
    } finally {
        await app.close();
        log('=== FIN TEST ===');
    }
}

testSimple();
