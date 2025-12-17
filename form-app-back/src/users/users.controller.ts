import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// Reutilizamos DTOs de Auth o creamos nuevos si necesitamos validar diferente
import { RegisterDto } from '../auth/dto/register.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin') // TODO: ESTE CONTROLADOR ES SOLO PARA ADMINS
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Listar todos los usuarios (clientes)
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    // Obtener un usuario por ID
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    // Crear un usuario manualmente (Admin puede crear otros Admins o Clientes)
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    create(@Body() createUserDto: RegisterDto) {
        return this.usersService.create(createUserDto);
    }

    // Actualizar usuario (ej. cambiar rol, password, nombre)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: any) { // TODO: Definir DTO de update user
        return this.usersService.update(id, updateUserDto);
    }

    // Eliminar usuario
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
