import { MongoClient } from 'mongodb';

async function listForms() {
    const uri = 'mongodb://localhost:27017/koru_app_contact_form';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('koru_app_contact_form');
        const forms = db.collection('forms');

        const allForms = await forms.find({}).toArray();
        console.log('--- FORMS DATA ---');
        allForms.forEach(f => {
            console.log(`ID: ${f.formId} | Website: ${f.website_id || f.owner_id} | Status: ${f.status}`);
        });
        console.log('--- END ---');
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

listForms();
