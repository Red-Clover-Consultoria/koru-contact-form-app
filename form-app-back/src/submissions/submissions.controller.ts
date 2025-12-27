import { Controller, Post, Body, UsePipes, ValidationPipe, HttpStatus, BadRequestException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmitFormDto } from './dto/submit-form.dto';

@Controller('forms')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    // 4.1. Endpoint: POST /api/forms/submit 
    @Post('submit')
    // Aplicamos el ValidationPipe para validar el payload contra SubmitFormDto
    @UsePipes(new ValidationPipe({ transform: true }))
    async submitForm(@Body() payload: SubmitFormDto) {

        try {
            const result = await this.submissionsService.processSubmission(payload);

            // Devolver el mensaje de éxito del formulario o un mensaje genérico de éxito
            return {
                statusCode: HttpStatus.OK,
                message: 'El formulario se ha enviado correctamente y el correo está en proceso de despacho.',
                submission_id: result._id
            };

        } catch (error) {
            // Manejo de errores específicos para el Honeypot
            if (error instanceof BadRequestException && error.message === 'Success (Filtered by spam)') {
                // Devuelve 200 OK aunque haya sido spam (para el bot) 
                return {
                    statusCode: HttpStatus.OK,
                    message: 'El formulario se ha enviado correctamente (procesamiento silencioso).'
                };
            }
            // Otros errores (ej. 404 Formulario no encontrado, 500 error del mailer)
            throw error;
        }
    }
}
