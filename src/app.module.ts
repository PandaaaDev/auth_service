import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from './token/token.service';
import { PrismaClient } from '@prisma/client';
import { CryptoService } from './crypto/crypto.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [TokenService, PrismaService, PrismaClient, CryptoService],
})
export class AppModule {}
