import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { CryptoService } from 'src/crypto/crypto.service';
import { TokenService } from 'src/token/token.service';
import { LoginDto } from './dto/login.dto';
import { AuthRequest } from './types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaClient: PrismaClient,
    private readonly cryptoService: CryptoService,
  ) {}

  @Post()
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ) {
    const userReqData = { email: body.email, password: body.password };
    const user = await this.prismaClient.user.findUnique({
      where: {
        email: userReqData.email,
      },
    });
    if (!user)
      throw new HttpException(`User don't exist`, HttpStatus.NOT_FOUND);
    const validPassword = await this.cryptoService.comparePasswords(
      userReqData.password,
      user.password,
    );
    if (!validPassword || !user.isActive || user.lockedOut)
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);

    const refreshToken = await this.tokenService.generateToken(user, 'refresh');
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const accessToken = await this.tokenService.generateToken(user, 'access');

    return { accessToken };
  }
  @Post('refresh')
  async refreshToken(@Req() req, @Res({ passthrough: true }) res) {
    const refresh_token = req.cookies['refresh_token'];
    if (!refresh_token) throw new BadRequestException('Missing token');
    const { refreshToken, accessToken } =
      await this.tokenService.refreshToken(refresh_token);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }
  @Get('me')
  async getUser(@Req() req: AuthRequest) {
    const accessToken = await this.tokenService.validateToken(
      req.headers.authorization.replace('Bearer ', ''),
      'access',
    );
    const user = await this.prismaClient.user.findUnique({
      where: {
        id: accessToken.sub,
      },
    });
    delete user['password'];
    return user;
  }
}
