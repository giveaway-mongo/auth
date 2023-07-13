import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@src/modules/auth/jwt.strategy';
import { AuthController } from '@src/modules/auth/auth.controller';
import { PrismaModule } from '@src/prisma/prisma.module';
import { jwtConstants } from '@src/modules/auth/constants';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
