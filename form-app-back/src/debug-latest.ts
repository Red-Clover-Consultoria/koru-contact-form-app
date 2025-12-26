import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Submission } from './submissions/schemas/submission.schema';
import { Form } from './forms/schemas/form.schema';
import { Model } from 'mongoose';

async function checkLatestData() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const submissionModel = app.get<Model<Submission>>(getModelToken(Submission.name));
    const formModel = app.get<Model<Form>>(getModelToken(Form.name));

    console.log("--- CONFIGURACIÓN DEL FORMULARIO ---");
    const form = await formModel.findOne({ form_id: 'test-form-001' }).exec();
    if (form) {
        console.log("Form ID:", form._id);
        console.log("Owner ID:", form.owner_id);
        console.log("Admin Email (Destinatario):", form.email_settings?.admin_email);
        console.log("Autoresponder:", form.email_settings?.autoresponder);
    } else {
        console.log("❌ Formulario no encontrado");
    }

    console.log("\n--- ÚLTIMA SUBMISSION ---");
    const submission = await submissionModel.findOne({ form_id: 'test-form-001' }).sort({ createdAt: -1 }).exec();

    if (submission) {
        console.log("ID:", submission._id);
        console.log("Data:", submission.data);
        console.log("Mail Log:", JSON.stringify(submission.mail_log, null, 2));
    } else {
        console.log("❌ No se encontraron submissions");
    }

    await app.close();
}

checkLatestData();
