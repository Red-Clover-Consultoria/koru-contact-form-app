// src/repro-400.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import axios from 'axios';

const PORT = 3002;
const BASE_URL = `http://localhost:${PORT}/api`;

async function reproduce() {
    const app = await NestFactory.create(AppModule);
    await app.listen(PORT);

    try {
        console.log('Iniciando reproducción de error 400...');

        // 1. LOGIN
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'test@mock.local',
            password: 'mockpassword123'
        });
        const { token } = loginRes.data;

        // 2. CREATE FORM WITH MISSING ADMIN_EMAIL
        console.log('Intentando crear formulario sin admin_email...');
        try {
            await axios.post(`${BASE_URL}/forms`, {
                formId: 'repro-400',
                title: 'Repro 400',
                fields_config: [],
                layout_settings: {
                    display_type: 'Inline',
                    position: 'Bottom-Right',
                    bubble_icon: 'Envelope',
                    accent_color: '#00C896',
                    submit_text: 'Enviar',
                    success_msg: 'Ok'
                },
                email_settings: {
                    // admin_email missing!
                    subject_line: 'New contact',
                    autoresponder: false
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error: any) {
            console.log('Status esperado:', error.response?.status);
            console.log('Mensaje:', JSON.stringify(error.response?.data?.message));
        }

    } catch (err: any) {
        console.error('Error no esperado:', err.message);
    } finally {
        await app.close();
    }
}

reproduce();
