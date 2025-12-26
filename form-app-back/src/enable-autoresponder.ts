import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Form } from './forms/schemas/form.schema';
import { Model } from 'mongoose';

async function enableAutoresponder() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const formModel = app.get<Model<Form>>(getModelToken(Form.name));

    const testAppId = 'test-form-001';

    const result = await formModel.updateOne(
        { form_id: testAppId },
        {
            $set: {
                'email_settings.autoresponder': true,
                'email_settings.subject_line': 'Nuevo contacto web: {{Nombre Completo}}',
                'layout_settings.success_msg': '¡Gracias! Te responderemos pronto.'
            }
        }
    );

    if (result.matchedCount > 0) {
        console.log('✅ Formulario actualizado exitosamente');
        console.log('   Autoresponder ACTIVADO');
        console.log('   Documentos modificados:', result.modifiedCount);
    } else {
        console.log('❌ Formulario no encontrado');
    }

    await app.close();
}

enableAutoresponder();
