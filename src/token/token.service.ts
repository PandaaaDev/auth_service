import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaClient: PrismaClient,
  ) {}

  async generateToken(user: Pick<UserType, 'id'>, type: 'access' | 'refresh') {
    return await this.jwtService.signAsync(
      { sub: user.id },
      {
        expiresIn: type === 'access' ? '15m' : '1d',
        secret:
          type === 'access'
            ? process.env.JWT_ACCESS_SECRET
            : process.env.JWT_REFRESH_SECRET,
      },
    );
  }
  async validateToken(token: string, type: 'access' | 'refresh') {
    try {
      const secret =
        type === 'access'
          ? process.env.JWT_ACCESS_SECRET
          : process.env.JWT_REFRESH_SECRET;

      return await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException(`Invalid or expired ${type} token`);
    }
  }
  async refreshToken(token) {
    const validToken = await this.validateToken(token, 'refresh');
    if (validToken) {
      const user = await this.prismaClient.user.findUnique(validToken.sub);
      return {
        accessToken: this.generateToken(user, 'access'),
        refreshToken: this.generateToken(user, 'refresh'),
      };
    }
  }
}
interface UserType {
  id: string;
  email: string;
}
