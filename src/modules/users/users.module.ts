import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '@src/prisma/prisma.module';
import { ClientsModule } from '@nestjs/microservices';
import { getRabbitMQOptions } from '@common/rabbitMQ/rabbitMQ-options';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    PrismaModule,
    ClientsModule.register([
      { name: 'users-service', ...getRabbitMQOptions('new_queue') },
    ]),
  ],
  exports: [UsersService],
})
export class UsersModule {}
