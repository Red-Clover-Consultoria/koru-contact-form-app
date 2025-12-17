import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Submission } from './submissions/schemas/submission.schema';
import { Model } from 'mongoose';

async function checkSubmission() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const submissionModel = app.get<Model<Submission>>(getModelToken(Submission.name));

    const submissionId = '693cd7fbd4d2f5d1f854faba';
    const submission = await submissionModel.findById(submissionId);

    if (submission) {
        console.log('\n========================================');
        console.log('📋 SUBMISSION DETAILS');
        console.log('========================================');
        console.log('ID:', submission._id);
        console.log('Status:', submission.status);
        console.log('Data:', JSON.stringify(submission.data, null, 2));
        console.log('\n📧 MAIL LOG:');
        console.log(JSON.stringify(submission.mail_log, null, 2));
        console.log('========================================\n');
    } else {
        console.log('❌ Submission not found');
    }

    await app.close();
}

checkSubmission();
