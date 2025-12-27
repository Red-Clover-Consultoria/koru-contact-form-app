// src/auth/auth.service.ts

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { lastValueFrom } from 'rxjs';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
        private httpService: HttpService,
        private configService: ConfigService,
    ) { }

    // LOGIN
    // - MODO DEV (sin credenciales de Koru): usa usuarios locales de MongoDB (seed).
    // - MODO PROD (con Koru configurado): delega login a Koru Suite.
    async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
        // Permitimos que el frontend envíe `email` o `username`
        const email = (loginDto as any).email || loginDto.username;
        const { password } = loginDto;

        // Comprobar si tenemos credenciales/config de Koru para decidir el modo
        const koruApiUrl = this.configService.get<string>('KORU_API_URL') || 'https://www.korusuite.com/api';
        const koruAppId = this.configService.get<string>('KORU_APP_ID');
        const koruAppSecret = this.configService.get<string>('KORU_APP_SECRET');

        const hasKoruConfig = !!koruAppId && !!koruAppSecret;

        if (!hasKoruConfig) {
            console.log(`[AuthService] Login attempt for ${email}: MODO DESARROLLO (LOCAL)`);
            return this.localDevLogin(email, password);
        }

        console.log(`[AuthService] Login attempt for ${email}: MODO PRODUCCIÓN (KORU SUITE)`);
        console.log(`[AuthService] Using App ID: ${koruAppId}`);

        try {
            // El Identity Broker de Koru espera username/password en el body raíz
            // y las credenciales de la APP en los headers.
            // URL corregida: evitamos duplicar /api si ya viene en la variable.
            const loginUrl = `${koruApiUrl.replace(/\/$/, '')}/auth/login`;

            const response = await lastValueFrom(
                this.httpService.post(loginUrl, {
                    username: email,
                    password,
                }, {
                    headers: {
                        'X-App-ID': koruAppId,
                        'X-App-Secret': koruAppSecret,
                        'Content-Type': 'application/json',
                    },
                })
            );

            const koruData = response.data;

            // Buscar o crear usuario en nuestra base de datos para persistencia local/roles
            let user: UserDocument | null = await this.userModel.findOne({ email: koruData.user.email }).exec();

            if (!user) {
                const newUser = new this.userModel({
                    name: koruData.user.name,
                    email: koruData.user.email,
                    role: koruData.user.role || 'user',
                    koruId: koruData.user.id,
                    koruToken: koruData.access_token,
                });
                user = await newUser.save();
            } else {
                user.name = koruData.user.name;
                user.role = koruData.user.role || user.role;
                user.koruId = koruData.user.id;
                user.koruToken = koruData.access_token;
                await user.save();
            }

            // DEVOLVEMOS EL TOKEN DE KORU DIRECTAMENTE
            // Esto asegura que la sesión del frontend sea válida para el KoruAuthMiddleware
            return {
                token: koruData.access_token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            };
        } catch (error: any) {
            const status = error.response?.status;
            const errorData = error.response?.data;

            console.error(`[AuthService] Koru Login Error (${status}):`, JSON.stringify(errorData, null, 2) || error.message);

            if (status === 401) {
                // El error puede ser por credenciales de usuario o por App Secret inválido
                const message = errorData?.message || 'Credenciales inválidas en Koru Suite';
                throw new UnauthorizedException(message);
            } else if (status === 403) {
                throw new UnauthorizedException('Acceso denegado: Tu usuario no tiene permisos para esta App.');
            } else {
                throw new BadRequestException(
                    errorData?.message || 'Error de conexión con el Identity Broker de Koru'
                );
            }
        }
    }

    // LOGIN LOCAL (DESARROLLO)
    private async localDevLogin(email: string, password: string): Promise<{ token: string; user: any }> {
        const user = await this.userModel.findOne({ email }).exec();

        if (!user || !user.password) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // En desarrollo, generamos un token temporal si no hay Koru
        const token = this.jwtService.sign({ id: user._id, email: user.email, role: user.role });

        return {
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
}

