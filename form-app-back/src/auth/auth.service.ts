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
    // - MODO MOCK (NODE_ENV=development): Devuelve usuario mock sin llamar a Koru
    // - MODO DEV (sin credenciales de Koru): usa usuarios locales de MongoDB (seed).
    // - MODO PROD (con Koru configurado): delega login a Koru Suite.
    async login(loginDto: LoginDto): Promise<{ token: string; user: any; websites: any[] }> {
        // Permitimos que el frontend envíe `email` o `username`
        const email = (loginDto as any).email || loginDto.username;
        const { password } = loginDto;

        // ============================================================
        // MODO MOCK LOCAL (para testing sin API externa)
        // ============================================================
        const nodeEnv = this.configService.get<string>('NODE_ENV');
        if (nodeEnv === 'development') {
            console.log(`[AuthService] Login attempt for ${email}: MODO MOCK (DEVELOPMENT)`);
            return this.mockLocalLogin(email, password);
        }

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
        console.log('DEBUG KORU API URL:', this.configService.get('KORU_API_URL'));
        console.log(`[AuthService] Using App ID: ${koruAppId}`);

        try {
            // El Identity Broker de Koru espera username/password en el body raíz
            // y las credenciales de la APP en los headers.
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
            console.log('DEBUG KORU RESPONSE:', JSON.stringify({ user: koruData.user, websites: koruData.websites }));
            console.log('[AuthService] Koru Login Response User Keys:', Object.keys(koruData.user));

            // FIX: Koru devuelve 'websites' en la raíz, no dentro de 'user'
            console.log('[AuthService] Koru Root Keys:', Object.keys(koruData));
            const rawWebsites = koruData.websites || [];
            console.log('[AuthService] Raw Websites received (Root):', rawWebsites);

            // Extraer solo los IDs
            const websiteIds = Array.isArray(rawWebsites)
                ? rawWebsites.map((w: any) => w.id || w) // Soporte para objetos u strings directos
                : [];

            console.log('[AuthService] Mapped Website IDs:', websiteIds);

            // Buscar o crear usuario en nuestra base de datos para persistencia local/roles
            let user: UserDocument | null = await this.userModel.findOne({ email: koruData.user.email }).exec();

            if (!user) {
                const newUser = new this.userModel({
                    name: koruData.user.name,
                    email: koruData.user.email,
                    role: koruData.user.role || 'user',
                    koruId: koruData.user.id,
                    koruToken: koruData.access_token,
                    websites: websiteIds, // Guardamos los IDs limpios
                });
                user = await newUser.save();
            } else {
                user.name = koruData.user.name;
                user.role = koruData.user.role || user.role;
                user.koruId = koruData.user.id;
                user.koruToken = koruData.access_token;
                user.websites = websiteIds; // Actualizamos los IDs
                await user.save();
            }

            // GENERAR JWT PROPIO PARA NUESTRA SESIÓN INTERNA
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role,
                websites: websiteIds, // Inyectamos los IDs en el token
                koruToken: koruData.access_token,
            };
            console.log('DEBUG JWT PAYLOAD:', payload);

            const token = this.jwtService.sign(payload);

            return {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                websites: websiteIds, // Websites en la raíz
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
    private async localDevLogin(email: string, password: string): Promise<{ token: string; user: any; websites: any[] }> {
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
            websites: user.websites || [], // Websites en la raíz
        };
    }

    // ============================================================
    // MOCK LOGIN: Para testing local sin llamar a API externa
    // ============================================================
    private async mockLocalLogin(email: string, password: string): Promise<{ token: string; user: any; websites: any[] }> {
        // WebsiteId de prueba hardcodeado
        const MOCK_WEBSITE_ID = '50dc4ac0-4eae-4f45-80d5-c30bf4520662';

        console.log('[AuthService] MOCK LOGIN - No se llama a API externa');
        console.log('[AuthService] MOCK WEBSITE_ID:', MOCK_WEBSITE_ID);

        // Buscar o crear usuario mock en MongoDB
        let user = await this.userModel.findOne({ email }).exec();

        if (!user) {
            // Crear usuario mock si no existe
            const newUser = new this.userModel({
                name: 'Usuario Mock',
                email: email,
                role: 'admin',
                koruId: 'mock-koru-id',
                websites: [MOCK_WEBSITE_ID],
            });
            user = await newUser.save();
            console.log('[AuthService] Usuario mock creado:', user.email);
        } else {
            // Actualizar websites del usuario existente
            user.websites = [MOCK_WEBSITE_ID];
            await user.save();
            console.log('[AuthService] Usuario mock actualizado:', user.email);
        }

        // Generar JWT con los datos mock
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role || 'admin',
            websites: [MOCK_WEBSITE_ID],
        };

        const token = this.jwtService.sign(payload);

        return {
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            websites: [MOCK_WEBSITE_ID], // Websites en la raíz
        };
    }
}

