import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UserRole, User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: { email: string; password: string; role: UserRole }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
