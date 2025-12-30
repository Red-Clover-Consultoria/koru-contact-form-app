// src/test-full-flow.ts
// Script de prueba completo para validar todo el flujo Koru
// Ejecutar con: npx ts-node src/test-full-flow.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FormsService } from './forms/forms.service';
import { AuthService } from './auth/auth.service';

async function testFullFlow() {
    console.log('============================================================');
    console.log('TEST: Flujo Completo Koru Suite');
    console.log('============================================================');

    const app = await NestFactory.createApplicationContext(AppModule);
    const formsService = app.get(FormsService);
    const authService = app.get(AuthService);

    try {
        // 1. LOGIN CON KORU
        console.log('\n[PASO 1] Probando login con Koru Suite...');
        console.log('------------------------------------------------------------');

        // NOTA: Reemplaza estos valores con credenciales reales de prueba
        const loginDto = {
            username: 'ksimari@redclover.com.ar',  // <-- Cambiar por email real
            password: 'test1234!'     // <-- Cambiar por password real
        };

        try {
            const loginResult = await authService.login(loginDto);
            console.log('[OK] Login exitoso');
            console.log('    Usuario:', loginResult.user.email);
            console.log('    Websites autorizados:', loginResult.user.websites);

            if (loginResult.user.websites && loginResult.user.websites.length > 0) {
                const testWebsiteId = loginResult.user.websites[0];
                console.log('\n[PASO 2] Probando validacion de websiteId:', testWebsiteId);
                console.log('------------------------------------------------------------');

                // Intentar crear un formulario de prueba
                const testFormDto = {
                    formId: `test-form-${Date.now()}`,
                    title: 'Formulario de Prueba Koru Sync',
                    fields_config: [
                        { id: 'name', type: 'text', label: 'Nombre', required: true, width: '100%' }
                    ],
                    layout_settings: {
                        display_type: 'Inline',
                        position: 'Bottom-Right',
                        bubble_icon: 'Envelope',
                        accent_color: '#00C896',
                        submit_text: 'Enviar',
                        success_msg: 'Gracias!'
                    },
                    email_settings: {
                        admin_email: 'admin@test.com',
                        subject_line: 'Test Subject',
                        autoresponder: false
                    }
                };

                console.log('    Intentando crear formulario con websiteId:', testWebsiteId);

                try {
                    const createdForm = await formsService.create(testFormDto as any, testWebsiteId);
                    console.log('[OK] Formulario creado exitosamente');
                    console.log('    ID:', (createdForm as any)._id);
                    console.log('    isActive:', createdForm.isActive);
                    console.log('    website_id:', (createdForm as any).website_id);

                    // Limpiar - eliminar el formulario de prueba
                    await (formsService as any).formModel.deleteOne({ _id: (createdForm as any)._id });
                    console.log('[OK] Formulario de prueba eliminado');

                } catch (createError: any) {
                    console.log('[ERROR] Error al crear formulario:', createError.message);
                }
            }

        } catch (loginError: any) {
            console.log('[ERROR] Login fallido:', loginError.message);
            console.log('    Status:', loginError.response?.status);
            console.log('    Data:', JSON.stringify(loginError.response?.data, null, 2));
            console.log('    Asegurate de configurar credenciales validas en el script');
        }

        // 3. EJECUTAR CRON JOB
        console.log('\n[PASO 3] Ejecutando Cron Job de sincronizacion...');
        console.log('------------------------------------------------------------');

        const formsBefore = await (formsService as any).formModel.countDocuments({ isActive: true });
        console.log('    Formularios activos antes:', formsBefore);

        await formsService.handleCron();

        const formsAfter = await (formsService as any).formModel.countDocuments({ isActive: true });
        const formsInactive = await (formsService as any).formModel.countDocuments({ isActive: false });

        console.log('    Formularios activos despues:', formsAfter);
        console.log('    Formularios inactivos:', formsInactive);

        // 4. RESUMEN
        console.log('\n============================================================');
        console.log('RESUMEN FINAL:');
        console.log('============================================================');
        console.log('    Formularios activos:', formsAfter);
        console.log('    Formularios inactivos:', formsInactive);
        console.log('    Cambio:', formsBefore - formsAfter, 'formularios desactivados');
        console.log('============================================================');

    } catch (error: any) {
        console.error('[ERROR] Error durante la prueba:', error.message);
    } finally {
        await app.close();
    }
}

testFullFlow();
