import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(user: UserType) {
    return this.jwtService.sign(user, { expiresIn: '15m' });
  }
  async generateRefreshToken(user: UserType) {
    return this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
    );
  }
  validateAccessToken(token) {}
  validateRefreshToken(token) {
    try {
      const tokenData = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return tokenData;
    } catch (error) {
      console.error('Refresh token validation error:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
  rotateRefreshToken() {}
  refreshToken(token) {}
}

interface UserType {
  id: string;
  email: string;
}
