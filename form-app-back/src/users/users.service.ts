import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    // Listar todos los usuarios (excluyendo password)
    async findAll(): Promise<User[]> {
        return this.userModel.find().select('-password').exec();
    }

    // Buscar un usuario por ID
    async findOne(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).select('-password').exec();
    }

    // Crear usuario (Admin capability)
    async create(createUserDto: RegisterDto): Promise<UserDocument> {
        const { email, password, name, role } = createUserDto;

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('El correo electrónico ya existe');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Aquí sí permitimos que el Admin defina el rol, o default a 'client'
        const newUser = await this.userModel.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'client',
        });

        // const userObj = newUser.toObject();
        // delete (userObj as any).password;
        return newUser;
    }

    // Actualizar usuario
    async update(id: string, updateUserDto: any): Promise<UserDocument> {
        const { password, ...rest } = updateUserDto;

        const updates: any = { ...rest };

        // Si se envía password, hashearlo
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, { $set: updates }, { new: true })
            .select('-password')
            .exec();

        if (!updatedUser) throw new NotFoundException('Usuario no encontrado');

        return updatedUser;
    }

    // Eliminar usuario
    async remove(id: string): Promise<any> {
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
        if (!deletedUser) throw new NotFoundException('Usuario no encontrado');
        return { message: 'Usuario eliminado correctamente' };
    }
}
