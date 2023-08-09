import { Controller } from '@nestjs/common';
import { UsersService } from '@src/modules/users/users.service';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  UserCreateInput,
  UserCreateResponse,
  UserUpdateResponse,
  UserListRequest,
  UserListResponse,
  UserUpdateInput,
  UserDetailRequest,
  UserDetailResponse,
} from './dto';

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
  async update(
    @Payload() updateUserInput: UserUpdateInput,
  ): Promise<UserUpdateResponse> {
    const { result, errors } = await this.usersService.update(updateUserInput);

    return {
      result,
      errors,
    };
  }

  @GrpcMethod('UsersService', 'ListUser')
  async list(listInput: UserListRequest): Promise<UserListResponse> {
    const { results, errors, count } = await this.usersService.list(listInput);

    return {
      results,
      count,
      errors,
    };
  }

  @GrpcMethod('UsersService', 'DetailUser')
  async detail(
    detailUserRequest: UserDetailRequest,
  ): Promise<UserDetailResponse> {
    const { result, errors } = await this.usersService.detail(
      detailUserRequest,
    );

    return {
      result,
      errors,
    };
  }
}
