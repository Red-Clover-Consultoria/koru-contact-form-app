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
            const KORU_API_URL = process.env.KORU_API_URL || 'https://www.korusuite.com/api';
            const KORU_APP_ID = process.env.KORU_APP_ID;
            const KORU_APP_SECRET = process.env.KORU_APP_SECRET;

            console.log(`[KoruAuth] Verifying token for App: ${KORU_APP_ID}`);

            const response = await axios.get(`${KORU_API_URL}/auth/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-App-ID': KORU_APP_ID,
                    'X-App-Secret': KORU_APP_SECRET
                }
            });

            // { id: "user_123", email: "user@example.com", websites: ["site_1", "site_2"] }
            req['koruUser'] = response.data;

            next();
        } catch (error) {
            const status = error.response?.status;
            const errorData = error.response?.data;

            console.error(`[KoruAuth] Verification Failed (${status}):`, JSON.stringify(errorData, null, 2) || error.message);

            throw new UnauthorizedException(
                `Token de Koru Suite inválido o expirado. ${errorData?.message || ''}`
            );
        }
    }
}
