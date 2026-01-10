import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuditModule } from '../../audit/audit.module';
import { EncryptionService } from '../../common/encryption.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    PrismaModule,
    UsersModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EncryptionService],
  exports: [AuthService],
})
export class AuthModule {}
