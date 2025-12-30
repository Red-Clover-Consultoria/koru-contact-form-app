// src/test-login-only.ts
// Solo prueba el login y muestra los websites

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function testLogin() {
    console.log('\n=== TEST LOGIN KORU ===\n');

    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);

    try {
        const result = await authService.login({
            username: 'ksimari@redclover.com.ar',
            password: 'test1234!'
        });

        console.log('=== LOGIN EXITOSO ===');
        console.log('Email:', result.user.email);
        console.log('Role:', result.user.role);
        console.log('Websites:', JSON.stringify(result.user.websites, null, 2));
        console.log('Token (primeros 50 chars):', result.token.substring(0, 50) + '...');

    } catch (e: any) {
        console.log('=== LOGIN FALLIDO ===');
        console.log('Error:', e.message);
        console.log('Status:', e.response?.status);
        console.log('Data:', JSON.stringify(e.response?.data, null, 2));
    } finally {
        await app.close();
    }
}

testLogin();
