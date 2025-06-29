import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { CryptoService } from 'src/crypto/crypto.service';
import { TokenService } from 'src/token/token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
      throw new HttpException(`Not Authenticated`, HttpStatus.BAD_REQUEST);

    const refreshToken = await this.tokenService.generateRefreshToken(user);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const accessToken = await this.tokenService.generateAccessToken(user);

    return { accessToken };
  }
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const hashedPassword = await this.cryptoService.hashPassword(body.password);
    await this.prismaClient.user.create({
      data: {
        ...body,
        password: hashedPassword,
        isActive: false,
        lockedOut: false,
      },
    });
  }

  @Post('refresh')
  async refreshToken(@Body() body, @Req() request, @Res() res) {
    const refresh_token = request.cookies['refresh_token'];
    console.log(refresh_token);
    const validToken =
      await this.tokenService.validateRefreshToken(refresh_token);

    if (validToken && validToken.sub !== body.id) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return 'Works fine!';
  }
}
