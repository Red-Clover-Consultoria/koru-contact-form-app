import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: false })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: false })
    password: string;

    @Prop({ default: 'user' })
    role: string;

    @Prop({ required: false })
    koruId: string; // ID del usuario en Koru Suite

    @Prop({ required: false })
    koruToken: string; // Token JWT de Koru
}

export const UserSchema = SchemaFactory.createForClass(User);
