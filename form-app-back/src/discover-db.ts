import { MongoClient } from 'mongodb';

async function listAll() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const admin = client.db().admin();
        const dbs = await admin.listDatabases();

        console.log('DATABASES FOUND:');
        for (const dbInfo of dbs.databases) {
            console.log(`- ${dbInfo.name}`);
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`  * ${col.name} (${count} docs)`);
                if (col.name === 'forms' && count > 0) {
                    const sample = await db.collection(col.name).findOne({});
                    console.log(`    SAMPLE ID: ${sample?.formId}`);
                }
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

listAll();
