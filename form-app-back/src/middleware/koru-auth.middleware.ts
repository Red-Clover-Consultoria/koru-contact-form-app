import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

@Injectable()
export class KoruAuthMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No se proporcionó un token de Koru Suite');
        }

        const token = authHeader.replace('Bearer ', '');

        try {
            // En producción, esto debería validar el token con la API de Koru Suite
            // GET https://api.korusuite.com/auth/verify (ejemplificado)
            const KORU_API_URL = process.env.KORU_API_URL || 'https://api.korusuite.com';

            const response = await axios.get(`${KORU_API_URL}/auth/verify-token`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // El backend de Koru nos devuelve la info del usuario y sus websites autorizados
            // { id: "user_123", email: "user@example.com", websites: ["site_1", "site_2"] }
            req['koruUser'] = response.data;

            next();
        } catch (error) {
            console.error('Koru Auth Error:', error.response?.data || error.message);
            throw new UnauthorizedException('Token de Koru Suite inválido o expirado');
        }
    }
}
