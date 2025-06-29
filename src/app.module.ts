import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RbacService } from './rbac/rbac.service';
import { RbacController } from './rbac/rbac.controller';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from './token/token.service';
import { PrismaClient } from '@prisma/client';
import { CryptoService } from './crypto/crypto.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    RedisModule,
  ],
  controllers: [AppController, RbacController, AuthController, UserController],
  providers: [
    AppService,
    RbacService,
    TokenService,
    PrismaService,
    PrismaClient,
    CryptoService,
    UserService,
  ],
})
export class AppModule {}
