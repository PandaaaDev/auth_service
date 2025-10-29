import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaClient: PrismaClient) {}
  async getUserByID(id: string) {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id,
      },
    });
    delete user['password'];
    return user;
  }
  async getUserByEmail(email: string) {
    const user = this.prismaClient.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }
}
