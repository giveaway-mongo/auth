import { Controller } from '@nestjs/common';
import { UsersService } from '@src/modules/users/users.service';
import {
  EventPattern,
  GrpcMethod,
  Payload,
  Transport,
} from '@nestjs/microservices';
import {
  CATEGORIES_SERVICE_BROKER_EVENTS,
  DEALS_SERVICE_BROKER_EVENTS,
  UserCreateInput,
  UserCreateResponse,
  UserDeleteInput,
  UserDeleteResponse,
  UserDetailInput,
  UserDetailResponse,
  UserListRequest,
  UserListResponse,
  UserUpdateInput,
  UserUpdateResponse,
  DealEvent,
  CategoryEvent,
  UsersUpdateResponse,
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
    detailUserRequest: UserDetailInput,
  ): Promise<UserDetailResponse> {
    const { result, errors } = await this.usersService.detail(
      detailUserRequest,
    );

    return {
      result,
      errors,
    };
  }

  @GrpcMethod('UsersService', 'DeleteUser')
  async delete(
    deleteUserRequest: UserDeleteInput,
  ): Promise<UserDeleteResponse> {
    const { result, errors } = await this.usersService.delete(
      deleteUserRequest,
    );

    return {
      result,
      errors,
    };
  }

  @EventPattern(DEALS_SERVICE_BROKER_EVENTS.DEAL_CREATED, Transport.RMQ)
  async handleDealCreatedEvent(@Payload() data: DealEvent): Promise<void> {
    // TODO: Handle deal created event
    // TODO: When deal has create initial status should be "active"
    // TODO: figure out what are exact statuses
  }

  @EventPattern(DEALS_SERVICE_BROKER_EVENTS.DEAL_UPDATED, Transport.RMQ)
  async handleDealUpdatedEvent(@Payload() data: DealEvent): Promise<void> {
    // TODO: Handle deal updated event
  }

  @EventPattern(
    CATEGORIES_SERVICE_BROKER_EVENTS.CATEGORY_UPDATED,
    Transport.RMQ,
  )
  async handleCategoryUpdatedEvent(
    @Payload() data: CategoryEvent,
  ): Promise<UsersUpdateResponse> {
    return await this.usersService.updateUsersFavoriteCategories(data);
  }

  @EventPattern(
    CATEGORIES_SERVICE_BROKER_EVENTS.CATEGORY_DELETED,
    Transport.RMQ,
  )
  async handleCategoryDeletedEvent(
    @Payload() data: CategoryEvent,
  ): Promise<UsersUpdateResponse> {
    return await this.usersService.deleteUsersFavoriteCategories(data);
  }
}
