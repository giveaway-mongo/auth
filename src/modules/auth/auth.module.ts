import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@src/modules/auth/local.strategy';
import { UsersModule } from '@src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@src/modules/auth/constants';
import { JwtStrategy } from '@src/modules/auth/jwt.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
