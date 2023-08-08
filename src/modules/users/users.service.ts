import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { WithError } from '@common/types/utils';
import * as bcrypt from 'bcrypt';
import {
  UserCreateResponse,
  UserCreateInput,
  UserUpdateInput,
  UserUpdateResponse,
} from './dto';
import { RpcException } from '@nestjs/microservices';
import { generateGuid } from '@common/utils/generate-guid';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createUserDto: UserCreateInput,
  ): Promise<WithError<UserCreateResponse>> {
    const { fullName, password, role, phoneNumber, email } = createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });

    if (existingUser) {
      const isSameEmail = existingUser?.email === email;
      if (isSameEmail) {
        throw new RpcException('User with provided email already exists.');
      }

      const isSamePhoneNumber = existingUser?.phoneNumber === phoneNumber;
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

    const result: UserCreateResponse['result'] = {
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
    const {
      fullName,
      phoneNumber,
      email,
      // guid, TODO: implement guid in DTO
    } = updateUserDto;

    // handle email duplicates
    const userWithSameEmail = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
        },
        guid: {
          not: '', // TODO: implement guid in DTO
        },
      },
    });

    if (userWithSameEmail) {
      throw new RpcException('User with provided email already exists.');
    }

    // handle phone number duplicates
    const userWithSamePhoneNumber = await this.prisma.user.findFirst({
      where: {
        phoneNumber: {
          equals: phoneNumber,
        },
        guid: {
          not: '', // TODO: implement guid in DTO
        },
      },
    });

    if (userWithSamePhoneNumber) {
      throw new RpcException('User with provided phone number already exists.');
    }

    try {
      const userToUpdate = await this.prisma.user.findUniqueOrThrow({
        where: {
          guid: '', // TODO: implement guid in DTO
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
        guid: '', // TODO: implement guid in DTO
      },
    });

    return {
      result: {
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        role: '', // TODO: figure out how to get role from database,
        avatar: '', // TODO: avatar exists in DTO but not in database
      },
      errors: null,
    };
  }
}
