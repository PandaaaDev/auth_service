import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthRequest } from './types';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post()
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ) {
    return this.auth.login(res, body);
  }
  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.refreshAccess(req, res);
  }
  @Get('me')
  async getUser(@Req() req: AuthRequest) {
    return this.auth.getUser(req);
  }
}
