// src/test-koru-sync.ts
// Script de prueba para validar el flujo de sincronización con Koru Suite
// Ejecutar con: npx ts-node src/test-koru-sync.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FormsService } from './forms/forms.service';

async function testKoruSync() {
    console.log('='.repeat(60));
    console.log('🧪 TEST: Sincronización Koru Suite');
    console.log('='.repeat(60));

    // Crear aplicación NestJS
    const app = await NestFactory.createApplicationContext(AppModule);
    const formsService = app.get(FormsService);

    try {
        // 1. LISTAR FORMULARIOS ACTIVOS ANTES
        console.log('\n📋 PASO 1: Estado inicial de formularios activos...');
        const formsBefore = await (formsService as any).formModel.find({ isActive: true }).exec();
        console.log(`   Formularios con isActive: true → ${formsBefore.length}`);

        if (formsBefore.length > 0) {
            console.log('   Detalle:');
            formsBefore.forEach((f: any) => {
                console.log(`   - ${f.title || f.name} | websiteId: ${f.website_id} | status: ${f.status}`);
            });
        }

        // 2. EJECUTAR CRON JOB MANUALMENTE
        console.log('\n⏰ PASO 2: Ejecutando Cron Job manualmente...');
        console.log('-'.repeat(60));
        await formsService.handleCron();
        console.log('-'.repeat(60));

        // 3. LISTAR FORMULARIOS ACTIVOS DESPUÉS
        console.log('\n📋 PASO 3: Estado final de formularios activos...');
        const formsAfter = await (formsService as any).formModel.find({ isActive: true }).exec();
        console.log(`   Formularios con isActive: true → ${formsAfter.length}`);

        const formsInactive = await (formsService as any).formModel.find({ isActive: false }).exec();
        console.log(`   Formularios con isActive: false → ${formsInactive.length}`);

        if (formsInactive.length > 0) {
            console.log('\n   ⚠️ Formularios inhabilitados:');
            formsInactive.forEach((f: any) => {
                console.log(`   - ${f.title || f.name} | websiteId: ${f.website_id}`);
            });
        }

        // 4. RESUMEN
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN:');
        console.log(`   Antes: ${formsBefore.length} activos`);
        console.log(`   Después: ${formsAfter.length} activos, ${formsInactive.length} inactivos`);
        const diff = formsBefore.length - formsAfter.length;
        if (diff > 0) {
            console.log(`   🔴 Se inhabilitaron ${diff} formularios`);
        } else if (diff < 0) {
            console.log(`   🟢 Se reactivaron ${Math.abs(diff)} formularios`);
        } else {
            console.log(`   ⚪ Sin cambios`);
        }
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        await app.close();
    }
}

testKoruSync();
