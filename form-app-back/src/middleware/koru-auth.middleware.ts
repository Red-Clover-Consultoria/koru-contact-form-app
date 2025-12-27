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
            // Default to www.korusuite.com/api as it's the verified base for activation
            const KORU_API_URL = process.env.KORU_API_URL || 'https://www.korusuite.com/api';

            console.log(`[KoruAuth] Verifying token at: ${KORU_API_URL}/auth/verify-token`);

            const response = await axios.get(`${KORU_API_URL}/auth/verify-token`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // { id: "user_123", email: "user@example.com", websites: ["site_1", "site_2"] }
            req['koruUser'] = response.data;

            next();
        } catch (error) {
            const errorData = error.response?.data;
            console.error('Koru Auth Error Details:', JSON.stringify(errorData, null, 2) || error.message);
            throw new UnauthorizedException('Token de Koru Suite inválido o expirado. ' + (errorData?.message || ''));
        }
    }
}
