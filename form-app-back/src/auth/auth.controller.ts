// src/auth/auth.controller.ts

import { Controller, Post, Body, UsePipes, ValidationPipe, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestWithUser } from './interfaces/user.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @UsePipes(new ValidationPipe({ transform: true }))
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req: RequestWithUser) {
        return req.user;
    }
}
