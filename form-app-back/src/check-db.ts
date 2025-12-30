import { MongoClient } from 'mongodb';

async function checkForm() {
    const uri = 'mongodb://localhost:27017/koru_app_contact_form';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('koru_app_contact_form');
        const forms = db.collection('forms');

        const formId = 'test-form-001';
        const form = await forms.findOne({ formId });

        if (form) {
            console.log('--- FORM START ---');
            console.log(JSON.stringify(form, null, 2));
            console.log('--- FORM END ---');
        } else {
            console.log('FORM NOT FOUND:', formId);
            const allForms = await forms.find({}).toArray();
            console.log('IDs EXISTENTES:', allForms.map(f => f.formId));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

checkForm();
