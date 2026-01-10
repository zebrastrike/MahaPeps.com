import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { EncryptionService } from '../../common/encryption.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface AuthPayload {
  accessToken: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async register(
    registerDto: RegisterDto,
    requestContext?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthPayload> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const role = registerDto.role ?? UserRole.CLIENT;

    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      role,
    });

    await this.auditService.log({
      userId: user.id,
      action: 'register',
      ipAddress: requestContext?.ipAddress,
      userAgent: requestContext?.userAgent,
    });

    return this.buildAuthPayload(user);
  }

  async login(
    loginDto: LoginDto,
    requestContext?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      await this.auditService.log({
        action: 'login_failed',
        metadata: {
          emailAttempted: this.encryptionService.encrypt(loginDto.email),
        },
        ipAddress: requestContext?.ipAddress,
        userAgent: requestContext?.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordValid) {
      await this.auditService.log({
        action: 'login_failed',
        metadata: {
          emailAttempted: this.encryptionService.encrypt(loginDto.email),
          userId: user.id,
        },
        ipAddress: requestContext?.ipAddress,
        userAgent: requestContext?.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.auditService.log({
      userId: user.id,
      action: 'login_success',
      ipAddress: requestContext?.ipAddress,
      userAgent: requestContext?.userAgent,
    });

    return this.buildAuthPayload(user);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  private async buildAuthPayload(user: User): Promise<AuthPayload> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const { password, ...safeUser } = user;
    return { accessToken, user: safeUser } as AuthPayload;
  }
}
