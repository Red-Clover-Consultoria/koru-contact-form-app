// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // 1. Extraer los roles requeridos del metadata del handler (el decorador @Roles)
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si no hay roles definidos en la ruta (@Roles() no usado), permitir acceso
        if (!requiredRoles) {
            return true;
        }

        // 2. Extraer el usuario de la petición
        // Nota: El 'user' viene inyectado por el JwtStrategy
        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            return false; // Si no hay usuario (JWT faltante o inválido), denegar
        }

        // 3. Comprobar la Autorización
        // Retorna true si el rol del usuario está incluido en los roles requeridos
        return requiredRoles.some((role) => user.role === role);
    }
}
