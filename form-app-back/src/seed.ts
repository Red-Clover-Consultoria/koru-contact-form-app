import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './auth/schemas/user.schema';
import { Form } from './forms/schemas/form.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const formModel = app.get<Model<Form>>(getModelToken(Form.name));

    // ---------------------------------------------------------
    // 1. CREAR USUARIOS (ADMIN Y CLIENTE)
    // ---------------------------------------------------------

    // Admin: ksimari@redclover.com.ar
    const adminEmail = 'ksimari@redclover.com.ar';
    const existingAdmin = await userModel.findOne({ email: adminEmail });
    let adminUser;

    if (existingAdmin) {
        console.log('✅ Admin user already exists:', adminEmail);
        // Asegurar que sea admin
        if (existingAdmin.role !== 'admin') {
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('   Rol actualizado a admin');
        }
        adminUser = existingAdmin;
    } else {
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        adminUser = await userModel.create({
            name: 'Karen Simari (Admin)',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
        });
        console.log(`✅ Admin user created: ${adminEmail}`);
    }

    // Cliente: simarikaren@gmail.com
    const clientEmail = 'simarikaren@gmail.com';
    const existingClient = await userModel.findOne({ email: clientEmail });
    let clientUser;

    if (existingClient) {
        console.log('✅ Client user already exists:', clientEmail);
        // Asegurar que sea cliente
        if (existingClient.role !== 'client') {
            existingClient.role = 'client';
            await existingClient.save();
            console.log('   Rol actualizado a client');
        }
        clientUser = existingClient;
    } else {
        const password = 'client123';
        const hashedPassword = await bcrypt.hash(password, 10);
        clientUser = await userModel.create({
            name: 'Karen Simari (Client)',
            email: clientEmail,
            password: hashedPassword,
            role: 'client',
        });
        console.log(`✅ Client user created: ${clientEmail}`);
    }

    // ---------------------------------------------------------
    // 2. CREAR FORMULARIO DE PRUEBA (ASIGNADO AL CLIENTE)
    // ---------------------------------------------------------
    const testAppId = 'test-form-001';
    const existingForm = await formModel.findOne({ app_id: testAppId });

    if (existingForm) {
        console.log('✅ Test form already exists:', testAppId);
        // Actualizar owner al cliente
        if (clientUser && existingForm.owner_id.toString() !== clientUser._id.toString()) {
            // @ts-ignore
            existingForm.owner_id = clientUser._id;
            console.log('   Owner actualizado al Cliente');
        }

        // Asegurar SIEMPRE que el email de admin en settings sea el del verdadero admin (cliente)
        if (clientUser && existingForm.email_settings.admin_email !== clientUser.email) {
            existingForm.email_settings.admin_email = clientUser.email; // simarikaren@gmail.com
            await existingForm.save();
            console.log('   Email de notificación actualizado a:', clientUser.email);
        }
    } else {
        if (!clientUser) throw new Error('Client user not created');

        await formModel.create({
            owner_id: clientUser._id,
            title: 'Formulario de Cliente',
            name: 'Contacto Prueba',
            status: 'active',
            app_id: testAppId,
            fields_config: [
                {
                    id: 'nombre',
                    type: 'text',
                    label: 'Nombre Completo',
                    required: true,
                    width: '100%'
                },
                {
                    id: 'email',
                    type: 'email',
                    label: 'Correo Electrónico',
                    required: true,
                    width: '100%'
                },
                {
                    id: 'mensaje',
                    type: 'textarea',
                    label: 'Mensaje',
                    required: true,
                    width: '100%'
                }
            ],
            layout_settings: {
                display_type: 'Inline',
                position: 'Bottom-Right',
                bubble_icon: 'Envelope',
                accent_color: '#00C896',
                submit_text: 'Enviar Mensaje',
                success_msg: '¡Gracias! Te responderemos pronto.',
                redirect_url: undefined
            },
            email_settings: {
                admin_email: adminEmail,
                subject_line: 'Nuevo contacto web: {{Nombre Completo}}',
                autoresponder: true
            }
        });
        console.log(`✅ Test form created: ${testAppId}`);
        console.log(`   Admin email: ${adminEmail}`);
    }

    await app.close();
}
bootstrap();
