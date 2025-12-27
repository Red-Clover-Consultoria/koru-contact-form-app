import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FormsModule } from './forms/forms.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KoruAuthMiddleware } from './middleware/koru-auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    FormsModule,
    SubmissionsModule,
    MailModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(KoruAuthMiddleware)
      .forRoutes(
        { path: 'forms', method: RequestMethod.GET },
        { path: 'forms', method: RequestMethod.POST },
        { path: 'forms/:id', method: RequestMethod.GET },
        { path: 'forms/:id', method: RequestMethod.PATCH },
        { path: 'forms/:id', method: RequestMethod.DELETE },
        { path: 'forms/:id/validate-permissions', method: RequestMethod.GET },
      );
  }
}
