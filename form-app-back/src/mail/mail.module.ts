import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { join } from 'path';

@Global() // Hacemos el MailModule global para inyectarlo en SubmissionsService
@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                // Usamos SMTP para la conexión (Compatible con SendGrid, Mailgun, etc.)
                transport: {
                    host: configService.get<string>('MAIL_HOST'),
                    port: 465, // Puerto SSL Recomendado
                    secure: true, // Forzar SSL
                    auth: {
                        user: configService.get<string>('MAIL_USER'),
                        pass: configService.get<string>('MAIL_PASS'),
                    },
                    pool: true, // Usar conexiones persistentes para mejorar performance
                    connectionTimeout: 10000,
                    greetingTimeout: 10000,
                    socketTimeout: 10000,
                    tls: {
                        rejectUnauthorized: false,
                    },
                },
                defaults: {
                    from: `"Koru Contact Form" <${configService.get<string>('MAIL_FROM_EMAIL')}>`,
                },
                template: {
                    dir: join(__dirname, 'templates'), // Directorio de plantillas HTML/Handlebars
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService],
    exports: [MailService], // Es vital exportar el servicio para usarlo fuera
})
export class MailModule { }
