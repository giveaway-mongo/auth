import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { WithError } from '@common/types/utils';
import * as bcrypt from 'bcrypt';
import {
  UserCreateResponse,
  UserCreateInput,
  UserUpdateInput,
  UserUpdateResponse,
  UserListRequest,
  UserListResponse,
  UserDto,
  UserDetailInput,
  UserDetailResponse,
  UserDeleteInput,
  UserDeleteResponse,
  UserEvent,
  CategoryEvent,
  USER_SERVICE_BROKER_EVENTS,
  UsersUpdateResponse,
} from './dto';
import { ClientRMQ, RpcException } from '@nestjs/microservices';
import { generateGuid } from '@common/utils/generate-guid';
import { getListOptions } from '@common/utils/list-params';
import { Prisma } from '@prisma/generated';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('users-service') private readonly clientRMQ: ClientRMQ,
  ) {}

  async create(
    createUserDto: UserCreateInput,
  ): Promise<WithError<UserCreateResponse>> {
    const { fullName, password, role, phoneNumber, email, avatar } =
      createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });

    if (existingUser) {
      const isSameEmail = existingUser.email === email;
      if (isSameEmail) {
        throw new RpcException('User with provided email already exists.');
      }

      const isSamePhoneNumber = existingUser.phoneNumber === phoneNumber;
      if (isSamePhoneNumber) {
        throw new RpcException(
          'User with provided phone number already exists.',
        );
      }
    }

    const userGuid = generateGuid();
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        guid: userGuid,
        password: hashedPassword,
        fullName,
        phoneNumber,
        email,
        isActive: false,
      },
    });

    this.clientRMQ.emit<string, UserEvent>(
      USER_SERVICE_BROKER_EVENTS.USER_CREATED,
      {
        guid: user.guid,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        // TODO: figure out how to get role from database
        role: null,
        // TODO: figure out correctness of this way of converting data to string
        createdAt: user.createdAt.toString(),
        // TODO: figure out correctness of this way of converting data to string
        updatedAt: user.updatedAt.toString(),
        isActive: user.isActive,
        avatarUrl: null,
        isDeleted: user.isDeleted,
        bidsAvailable: Number(user.bidsAvailable),
      },
    );

    const result: UserDto = {
      guid: user.guid,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      // TODO: figure out how to get role from database
      role: role,
      // TODO: avatar exists in DTO but not in database
      avatar: null,
    };

    return { result, errors: null };
  }

  async update(
    updateUserDto: UserUpdateInput,
  ): Promise<WithError<UserUpdateResponse>> {
    const { fullName, phoneNumber, email, guid, avatar } = updateUserDto;

    // handle email or phone number duplicates among other users
    const potentialUserDuplicate = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
        guid: {
          not: guid,
        },
      },
    });

    if (potentialUserDuplicate.email === email) {
      throw new RpcException('User with provided email already exists.');
    }

    if (potentialUserDuplicate.phoneNumber === phoneNumber) {
      throw new RpcException('User with provided phone number already exists.');
    }

    try {
      const userToUpdate = await this.prisma.user.findUniqueOrThrow({
        where: {
          guid: guid,
        },
      });
    } catch (e) {
      throw new RpcException('User not found.');
    }

    const updatedUser = await this.prisma.user.update({
      data: {
        email,
        phoneNumber,
        fullName,
      },
      where: {
        guid: guid,
      },
    });

    this.clientRMQ.emit<string, UserEvent>(
      USER_SERVICE_BROKER_EVENTS.USER_UPDATED,
      {
        guid: updatedUser.guid,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        // TODO: figure out how to get role from database
        role: null,
        // TODO: figure out correctness of this way of converting data to string
        createdAt: updatedUser.createdAt.toString(),
        // TODO: figure out correctness of this way of converting data to string
        updatedAt: updatedUser.updatedAt.toString(),
        isActive: updatedUser.isActive,
        avatarUrl: null,
        isDeleted: updatedUser.isDeleted,
        bidsAvailable: Number(updatedUser.bidsAvailable),
      },
    );

    const transformedUser: UserDto = {
      guid: updatedUser.guid,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber,
      role: '', // TODO: figure out how to get role from database,
      avatar: '', // TODO: avatar exists in DTO but not in database
    };

    return {
      result: transformedUser,
      errors: null,
    };
  }

  async list(listInput: UserListRequest): Promise<WithError<UserListResponse>> {
    const { where, skip, take, orderBy } = getListOptions<
      Prisma.UserWhereInput,
      Prisma.UserOrderByWithRelationInput
    >(listInput?.options);

    const [count, users] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        skip,
        where,
        orderBy,
        take,
      }),
    ]);

    const transformedUsers = users.map<UserDto>((user) => {
      return {
        guid: user.guid,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: '',
        avatar: null,
      };
    });

    return {
      results: transformedUsers,
      errors: null,
      count,
    };
  }

  async detail(
    userDetailRequest: UserDetailInput,
  ): Promise<WithError<UserDetailResponse>> {
    const { guid } = userDetailRequest;

    let userDto: UserDto = null;

    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          guid,
        },
      });

      userDto = {
        guid: user.guid,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: '',
        avatar: null,
      };
    } catch (e) {
      throw new RpcException('User not found.');
    }

    return {
      result: userDto,
      errors: null,
    };
  }

  async delete(
    userDeleteRequest: UserDeleteInput,
  ): Promise<WithError<UserDeleteResponse>> {
    const { guid } = userDeleteRequest;

    let deletedUserDto: UserDto = null;

    try {
      const deletedUser = await this.prisma.user.delete({
        where: {
          guid,
        },
      });

      deletedUserDto = {
        guid: deletedUser.guid,
        email: deletedUser.email,
        fullName: deletedUser.fullName,
        phoneNumber: deletedUser.phoneNumber,
        role: null,
        avatar: null,
      };

      this.clientRMQ.emit<string, UserEvent>(
        USER_SERVICE_BROKER_EVENTS.USER_DELETED,
        {
          guid: deletedUser.guid,
          email: deletedUser.email,
          fullName: deletedUser.fullName,
          phoneNumber: deletedUser.phoneNumber,
          // TODO: figure out how to get role from database
          role: null,
          // TODO: figure out correctness of this way of converting data to string
          createdAt: deletedUser.createdAt.toString(),
          // TODO: figure out correctness of this way of converting data to string
          updatedAt: deletedUser.updatedAt.toString(),
          isActive: deletedUser.isActive,
          avatarUrl: null,
          isDeleted: deletedUser.isDeleted,
          bidsAvailable: Number(deletedUser.bidsAvailable),
        },
      );
    } catch (e) {
      throw new RpcException('User not found.');
    }

    return {
      result: deletedUserDto,
      errors: null,
    };
  }

  async updateUsersFavoriteCategories(
    updatedCategory: CategoryEvent,
  ): Promise<WithError<UsersUpdateResponse>> {
    let updatedUsersCount = 0;
    let updatedUsers: UserDto[] = [];

    try {
      const [count, users] = await this.prisma.$transaction(async (tx) => {
        const usersWithCategoryToUpdate = await tx.user.findMany({
          where: {
            favoriteCategories: {
              some: {
                guid: updatedCategory.guid,
              },
            },
          },
        });
        const usersGuids = usersWithCategoryToUpdate.map((user) => user.guid);

        const { count } = await tx.user.updateMany({
          where: {
            guid: {
              in: usersGuids,
            },
          },
          data: {
            favoriteCategories: {
              updateMany: {
                where: {
                  guid: updatedCategory.guid,
                },
                data: {
                  description: updatedCategory.description,
                  title: updatedCategory.title,
                  parentGuid: updatedCategory.parentGuid,
                },
              },
            },
            updatedAt: {
              set: new Date().toISOString(),
            },
          },
        });

        return [count, usersWithCategoryToUpdate];
      });

      updatedUsersCount = count;
      updatedUsers = users.map<UserDto>((user) => {
        return {
          guid: user.guid,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: '',
          avatar: null,
        };
      });
    } catch (e) {
      throw new RpcException('Users not found.');
    }

    return {
      result: updatedUsers,
      count: updatedUsersCount,
      errors: null,
    };
  }

  async deleteUsersFavoriteCategories(
    deletedCategory: CategoryEvent,
  ): Promise<WithError<UsersUpdateResponse>> {
    let updatedUsersCount = 0;
    let updatedUsers: UserDto[] = [];

    try {
      const [count, users] = await this.prisma.$transaction(async (tx) => {
        const usersWithCategoryToDelete = await tx.user.findMany({
          where: {
            favoriteCategories: {
              some: {
                guid: deletedCategory.guid,
              },
            },
          },
        });
        const usersGuids = usersWithCategoryToDelete.map((user) => user.guid);

        const { count } = await tx.user.updateMany({
          where: {
            guid: {
              in: usersGuids,
            },
          },
          data: {
            favoriteCategories: {
              deleteMany: {
                where: {
                  guid: deletedCategory.guid,
                },
              },
            },
            updatedAt: {
              set: new Date().toISOString(),
            },
          },
        });

        return [count, usersWithCategoryToDelete];
      });

      updatedUsersCount = count;
      updatedUsers = users.map<UserDto>((user) => {
        return {
          guid: user.guid,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: '',
          avatar: null,
        };
      });
    } catch (e) {
      throw new RpcException('Users not found.');
    }

    return {
      result: updatedUsers,
      count: updatedUsersCount,
      errors: null,
    };
  }
}
