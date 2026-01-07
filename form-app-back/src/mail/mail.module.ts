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
                    port: configService.get<number>('MAIL_PORT'),
                    secure: configService.get<number>('MAIL_PORT') === 465, // true para 465 (SSL), false para 587 (STARTTLS)
                    auth: {
                        user: configService.get<string>('MAIL_USER'),
                        pass: configService.get<string>('MAIL_PASS'),
                    },
                    // Configuraciones de Timeout para evitar ETIMEDOUT en Railway
                    connectionTimeout: 10000, // 10s
                    greetingTimeout: 10000,
                    socketTimeout: 10000,
                    tls: {
                        rejectUnauthorized: false, // Descartar problemas de certificados en prod
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
