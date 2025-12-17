import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Form, FormSchema } from './schemas/form.schema';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Form.name, schema: FormSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [FormsController],
    providers: [FormsService],
    // Exportamos MongooseModule para que otros módulos (ej. Submissions) puedan usar el modelo Form
    exports: [MongooseModule],
})
export class FormsModule { }
