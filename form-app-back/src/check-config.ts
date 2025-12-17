import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Form } from './forms/schemas/form.schema';
import { Model } from 'mongoose';

async function checkFormConfig() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const formModel = app.get<Model<Form>>(getModelToken(Form.name));

    const testAppId = 'test-form-001';
    const form = await formModel.findOne({ app_id: testAppId });

    if (form) {
        console.log('\n========================================');
        console.log('CONFIGURACIÓN DEL FORMULARIO');
        console.log('========================================');
        console.log('App ID:', form.app_id);
        console.log('Admin Email:', form.email_settings.admin_email);
        console.log('Autoresponder:', form.email_settings.autoresponder);
        console.log('Subject Line:', form.email_settings.subject_line);
        console.log('Layout - Success Msg:', form.layout_settings.success_msg);
        console.log('========================================\n');
    } else {
        console.log('❌ Formulario no encontrado');
    }

    await app.close();
}

checkFormConfig();
