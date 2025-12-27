// src/auth/interfaces/user.interface.ts

export interface IUser {
    id: string;
    email: string;
    role: string;
    websites: string[]; // IDs de sitios autorizados en Koru Suite
    koruToken?: string; // Token original de Koru por si se necesita para handshakes externos
}

import { Request } from 'express';

export interface RequestWithUser extends Request {
    user: IUser;
}
