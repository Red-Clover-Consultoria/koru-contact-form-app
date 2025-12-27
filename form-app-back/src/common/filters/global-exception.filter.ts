import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('GlobalExceptionFilter');

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        // LOGGING SEGURO: Eliminamos 'password' y 'username' del log para evitar fugas en Railway
        const { password, username, ...safeBody } = request.body || {};

        this.logger.error(
            `[${request.method}] ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}`,
            `Body: ${JSON.stringify(safeBody)}`
        );

        // RESPUESTA SEGURA: Nunca devolvemos el body original en la respuesta de error
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: typeof message === 'object' ? (message as any).message || message : message,
        });
    }
}
