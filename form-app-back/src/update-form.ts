import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Form } from './forms/schemas/form.schema';
import { Model } from 'mongoose';

async function updateForm() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const formModel = app.get<Model<Form>>(getModelToken(Form.name));

    const testAppId = 'test-form-001';

    const result = await formModel.updateOne(
        { app_id: testAppId },
        {
            $set: {
                'email_settings.admin_email': 'ksimari@redclover.com.ar'
            }
        }
    );

    if (result.matchedCount > 0) {
        console.log('✅ Formulario actualizado exitosamente');
        console.log('   Admin email cambiado a: ksimari@redclover.com.ar');
        console.log('   Documentos modificados:', result.modifiedCount);

        // Verificar el cambio
        const updatedForm = await formModel.findOne({ app_id: testAppId });
        if (updatedForm) {
            console.log('   Verificación - Admin email:', updatedForm.email_settings.admin_email);
        }
    } else {
        console.log('❌ Formulario no encontrado');
    }

    await app.close();
}

updateForm();
