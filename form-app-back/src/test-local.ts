// src/test-local.ts
// Script de prueba local completo con modo MOCK
// Ejecutar con: npx ts-node src/test-local.ts
// IMPORTANTE: Asegurar que NODE_ENV=development en .env

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FormsService } from './forms/forms.service';
import { AuthService } from './auth/auth.service';
import axios from 'axios';

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function runLocalTest() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          TEST LOCAL - MODO MOCK KORU SUITE                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    // Crear aplicación NestJS y ponerla a escuchar
    const app = await NestFactory.create(AppModule);
    await app.listen(PORT);
    console.log(`[Server] Servidor de prueba escuchando en puerto ${PORT}`);
    console.log('');

    try {
        // ============================================================
        // PASO 1: LOGIN
        // ============================================================
        console.log('┌────────────────────────────────────────────────────────────┐');
        console.log('│ PASO 1: LOGIN                                              │');
        console.log('└────────────────────────────────────────────────────────────┘');

        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'test@mock.local',
            password: 'mockpassword123'
        });

        const { token, user } = loginResponse.data;
        console.log('✓ Login exitoso');
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Websites: ${JSON.stringify(user.websites)}`);
        console.log(`  Token: ${token.substring(0, 50)}...`);
        console.log('');

        // ============================================================
        // PASO 2: CREATE FORM
        // ============================================================
        console.log('┌────────────────────────────────────────────────────────────┐');
        console.log('│ PASO 2: CREATE FORM                                        │');
        console.log('└────────────────────────────────────────────────────────────┘');

        const formId = `test-local-${Date.now()}`;
        const websiteId = user.websites[0]; // Usar el websiteId mockeado

        const createResponse = await axios.post(
            `${BASE_URL}/forms`,
            {
                formId: formId,
                title: 'Test Local',
                websiteId: websiteId, // Enviamos explícitamente el websiteId
                fields_config: [
                    { id: 'name', type: 'text', label: 'Nombre', required: true, width: '100%' },
                    { id: 'email', type: 'email', label: 'Email', required: true, width: '100%' }
                ],
                layout_settings: {
                    display_type: 'Inline',
                    position: 'Bottom-Right',
                    bubble_icon: 'Envelope',
                    accent_color: '#00C896',
                    submit_text: 'Enviar',
                    success_msg: 'Gracias por tu mensaje!'
                },
                email_settings: {
                    admin_email: 'admin@test.local',
                    subject_line: 'Nuevo contacto: {{name}}',
                    autoresponder: false
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const createdForm = createResponse.data;
        console.log('✓ Formulario creado exitosamente');
        console.log(`  ID: ${createdForm._id}`);
        console.log(`  Title: ${createdForm.title}`);
        console.log(`  isActive: ${createdForm.isActive}`);
        console.log(`  website_id: ${createdForm.website_id}`);
        console.log(`  status: ${createdForm.status}`);
        console.log('');

        // ============================================================
        // PASO 3: VERIFY (GET ALL FORMS)
        // ============================================================
        console.log('┌────────────────────────────────────────────────────────────┐');
        console.log('│ PASO 3: VERIFY - GET ALL FORMS                             │');
        console.log('└────────────────────────────────────────────────────────────┘');

        const getResponse = await axios.get(`${BASE_URL}/forms`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const forms = getResponse.data;
        console.log(`✓ Formularios encontrados: ${forms.length}`);

        const testForm = forms.find((f: any) => f.formId === formId);
        if (testForm) {
            console.log('✓ Formulario de prueba verificado:');
            console.log(`  formId: ${testForm.formId}`);
            console.log(`  title: ${testForm.title}`);
            console.log(`  isActive: ${testForm.isActive}`);
            console.log(`  website_id: ${testForm.website_id}`);

            if (testForm.isActive === true) {
                console.log('');
                console.log('╔════════════════════════════════════════════════════════════╗');
                console.log('║  ✅ TEST PASSED: El formulario tiene isActive: true        ║');
                console.log('╚════════════════════════════════════════════════════════════╝');
            } else {
                console.log('');
                console.log('╔════════════════════════════════════════════════════════════╗');
                console.log('║  ❌ TEST FAILED: isActive debería ser true                 ║');
                console.log('╚════════════════════════════════════════════════════════════╝');
            }
        } else {
            console.log('❌ Formulario de prueba no encontrado en la lista');
        }

        // ============================================================
        // CLEANUP: Eliminar formulario de prueba
        // ============================================================
        console.log('');
        console.log('┌────────────────────────────────────────────────────────────┐');
        console.log('│ CLEANUP                                                    │');
        console.log('└────────────────────────────────────────────────────────────┘');

        await axios.delete(`${BASE_URL}/forms/${createdForm._id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✓ Formulario de prueba eliminado');

    } catch (error: any) {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  ❌ ERROR DURANTE EL TEST                                  ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        }
    } finally {
        await app.close();
        console.log('');
        console.log('[Server] Servidor cerrado');
    }
}

runLocalTest();
