import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() request: Request) {
    const user = (request as any).user;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  @Post('register')
  @Throttle(3, 60)
  async register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.authService.register(dto, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }

  @Post('login')
  @Throttle(5, 60)
  async login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }

  @Get('health')
  getHealth(): string {
    return 'auth-ok';
  }
}
