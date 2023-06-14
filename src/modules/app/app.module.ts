import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { isTestEnvironment } from '@common/utils/environment';
import { AuthModule } from '@src/modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@src/modules/auth/jwt-auth.guard';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !isTestEnvironment() ? '.env' : '.env.win-test',
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
