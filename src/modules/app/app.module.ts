import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { isTestEnvironment } from '@common/utils/environment';
import { AppController } from '@src/modules/app/app.controller';
import { AuthModule } from '@src/modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !isTestEnvironment() ? '.env' : '.env.test',
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
