import { Injectable } from '@nestjs/common';
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
  UserDetailRequest,
  UserDetailResponse,
} from './dto';
import { RpcException } from '@nestjs/microservices';
import { generateGuid } from '@common/utils/generate-guid';
import { getListOptions } from '@common/utils/list-params';
import { Prisma } from '@prisma/generated';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
    userDetailRequest: UserDetailRequest,
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
}
