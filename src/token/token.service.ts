import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async generateAccessToken(user: UserType) {
    return this.jwtService.sign(user, { expiresIn: '15m' });
  }
  async generateRefreshToken(user: UserType) {
    const token = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
    );
    try {
      this.saveRefreshToken(token, user.id);
    } catch (error) {
      console.error(`Could not save the token`, error);
      throw new InternalServerErrorException(`Could not save the token`);
    }

    return token;
  }
  validateAccessToken(token) {
    try {
      const tokenData = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return tokenData;
    } catch (error) {
      console.error('Access token validation error:', error);
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
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
  async saveRefreshToken(token, userId: string) {
    this.redis.set(`refreshToken:${userId}`, token, 'EX', 60 * 60 * 24 * 7);
  }
  async getSavedToken(userId: string) {
    try {
      const token = this.redis.get(`refreshToken:${userId}`);
      return token;
    } catch (error) {
      console.log(`Failed to save token for user ${userId}`, error);
      throw new InternalServerErrorException('Could not save token');
    }
  }
  revokeRefreshToken(userId: string) {
    try {
      this.redis.del(`refreshToken:${userId}`);
    } catch (error) {
      console.error(`Failed to revoke token for user ${userId}`, error);
      throw new InternalServerErrorException('Could not revoke tokens');
    }
  }
  async rotateTokens(userId) {
    //generate a new token fo user
    try {
      const accessToken = await this.generateAccessToken(userId);
      const refreshToken = await this.generateRefreshToken(userId);
      await this.redis.del(`refreshToken:${userId}`);
      await this.saveRefreshToken(refreshToken, userId);

      return { refreshToken, accessToken };
    } catch (error) {
      console.error(`Failed to rotate tokens for ${userId}`, error);
      throw new InternalServerErrorException("Could't rotate tokens");
    }
  }
}

interface UserType {
  id: string;
  email: string;
}
