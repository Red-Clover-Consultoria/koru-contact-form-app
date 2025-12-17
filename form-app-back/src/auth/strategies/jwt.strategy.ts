// src/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { ConfigService } from '@nestjs/config';

// Definición del Payload (la data que guardamos en el token)
interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        configService: ConfigService
    ) {
        super({
            // Extraer el JWT del header 'Authorization: Bearer <token>'
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Usar la clave secreta del .env
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey',
        });
    }

    // Método de validación: se ejecuta después de verificar la firma del token
    async validate(payload: JwtPayload) {
        // Busca al usuario en la DB para confirmar que sigue activo
        const user = await this.userModel.findById(payload.id);

        if (!user) {
            throw new UnauthorizedException('Token no válido');
        }

        // Retorna el usuario completo (o el payload) para inyectarlo en req.user
        return payload;
    }
}
