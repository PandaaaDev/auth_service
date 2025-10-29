import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { CryptoService } from 'src/crypto/crypto.service';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';

import type { Request, Response } from 'express';
import type { AuthRequest } from './types';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly cryptoService: CryptoService,
  ) {}
  async login(res: Response, body: LoginDto) {
    const user = await this.userService.getUserByEmail(body.email);
    if (!user) throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    const validPassword = await this.cryptoService.comparePasswords(
      body.password,
      user.password,
    );
    if (!validPassword || !user.isActive || user.lockedOut)
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);

    res.cookie(
      'refresh_token',
      await this.tokenService.generateToken(user, 'refresh'),
      {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: 24 * 60 * 60 * 1000,
      },
    );

    return {
      accessToken: await this.tokenService.generateToken(user, 'access'),
    };
  }
  async refreshAccess(req: Request, res: Response) {
    if (!req.cookies['refresh_token']) throw new BadRequestException();

    const refreshToken = await this.tokenService.validateToken(
      req.cookies['refresh_token'],
      'refresh',
    );
    const user = await this.userService.getUserByID(refreshToken.sub);

    if (!user.isActive || user.lockedOut) throw new BadRequestException();

    res.cookie(
      'refresh_token',
      await this.tokenService.generateToken(user, 'refresh'),
      {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: 24 * 60 * 60 * 1000,
      },
    );

    return {
      accessToken: await this.tokenService.generateToken(user, 'access'),
    };
  }
  async getUser(req: AuthRequest) {
    const accessToken = await this.tokenService.validateToken(
      req.headers.authorization.replace('Bearer ', ''),
      'access',
    );
    return this.userService.getUserByID(accessToken.sub);
  }
}
