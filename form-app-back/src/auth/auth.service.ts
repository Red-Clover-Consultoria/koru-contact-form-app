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
        const koruApiUrl = this.configService.get<string>('KORU_API_URL');
        const koruAppId = this.configService.get<string>('KORU_APP_ID');
        const koruAppSecret = this.configService.get<string>('KORU_APP_SECRET');

        const hasKoruConfig = !!koruApiUrl && !!koruAppId && !!koruAppSecret;

        if (!hasKoruConfig) {
            // ====== MODO DESARROLLO: LOGIN LOCAL ======
            return this.localDevLogin(email, password);
        }

        // ====== MODO PRODUCCIÓN: LOGIN CONTRA KORU SUITE ======
        try {
            const response = await lastValueFrom(
                this.httpService.post(`${koruApiUrl}/api/auth/login`, {
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

            const koruData = (response as any).data;

            // Buscar o crear usuario en nuestra base de datos
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
                // Actualizar datos del usuario desde Koru
                user.name = koruData.user.name;
                user.role = koruData.user.role || user.role;
                user.koruId = koruData.user.id;
                user.koruToken = koruData.access_token;
                await user.save();
            }

            if (!user) {
                throw new UnauthorizedException('No se pudo autenticar el usuario de Koru.');
            }

            // Generar JWT propio para nuestra aplicación
            const token = this.generateToken(user);

            return {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            };
        } catch (error: any) {
            // Manejar diferentes tipos de errores de Koru
            if (error.response?.status === 401) {
                throw new UnauthorizedException('Credenciales inválidas en Koru Suite');
            } else if (error.response?.status === 403) {
                throw new UnauthorizedException('Usuario no autorizado en Koru Suite');
            } else {
                throw new BadRequestException(
                    error.response?.data?.message || 'Error al conectar con Koru Suite'
                );
            }
        }
    }

    // GENERADOR DE TOKEN JWT PROPIO
    private generateToken(user: UserDocument): string {
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.sign(payload);
    }

    // LOGIN LOCAL (DESARROLLO) USANDO USERS DE MONGO
    private async localDevLogin(email: string, password: string): Promise<{ token: string; user: any }> {
        const user = await this.userModel.findOne({ email }).exec();

        if (!user || !user.password) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const token = this.generateToken(user);

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

