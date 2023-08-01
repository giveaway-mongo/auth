import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { WithError } from '@common/types/utils';
import * as bcrypt from 'bcrypt';
import { UserCreateResponse, UserCreateInput } from './dto';
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

  async update(): Promise<{}> {}
}
