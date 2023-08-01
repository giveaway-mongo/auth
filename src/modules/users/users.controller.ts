import { Controller } from '@nestjs/common';
import { UsersService } from '@src/modules/users/users.service';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { UserCreateInput, UserCreateResponse } from './dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'CreateUser')
  async create(
    @Payload() createUserInput: UserCreateInput,
  ): Promise<UserCreateResponse> {
    const { result, errors } = await this.usersService.create(createUserInput);

    return {
      result,
      errors,
    };
  }

  @GrpcMethod('UsersService', 'UpdateUser')
  async update(): Promise<{}> {
    const { result, errors } = await this.usersService.update();

    return {
      result,
      errors,
    };
  }

  @GrpcMethod('UsersService', 'DeleteUser')
  async delete(): Promise<{}> {
    const { result, errors } = await this.usersService.delete();

    return {
      result,
      errors,
    };
  }

  @GrpcMethod('UsersService', 'GetUserById')
  async getById(): Promise<{}> {
    const { result, errors } = await this.usersService.getById();

    return {
      result,
      errors,
    };
  }
}
