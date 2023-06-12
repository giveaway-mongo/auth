import { Injectable } from '@nestjs/common';
import { UsersService } from '@src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  VerifyEmailTokenRequest,
  VerifyEmailTokenResponse,
} from './dto/auth.dto';
import { WithError } from '@common/types/utils';
import * as bcrypt from 'bcrypt';
import { generateGuid } from '@common/utils/generate-guid';
import { PrismaService } from '@src/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { sendEmail } from '@src/utils/sendgrid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signUp(
    signUpRequest: SignUpRequest,
  ): Promise<WithError<SignUpResponse>> {
    const { email, password, fullName, phoneNumber } = signUpRequest;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (user) {
      throw new RpcException('Email already exists.');
    }

    // send email

    // await sendEmail({
    //   to: 'anvarabdulsatarov@gmail.com',
    //   from: 'a.abdulsatarov.b@gmail.com',
    //   html: '<strong>hello</strong> world!',
    //   subject: 'Some subject',
    //   text: 'some text here',
    // });

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          guid: generateGuid(),
          email,
          password: hashedPassword,
          fullName,
          phoneNumber,
          isActive: false,
        },
      });

      await tx.userConfirmationToken.create({
        data: {
          email,
          isActive: true,
          guid: user.guid,
          verificationToken: generateGuid(),
        },
      });
    });

    return { errors: null };
  }

  async signIn(
    signInRequest: SignInRequest,
  ): Promise<WithError<SignInResponse>> {
    const { email, password } = signInRequest;

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new RpcException('User with such email not found.');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new RpcException('Incorrect password.');
    }

    const payload = {
      guid: user.guid,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      result: { email, accessToken, refreshToken: '' },
      errors: null,
    };
  }

  async verifyEmailToken(
    verifyEmailTokenRequest: VerifyEmailTokenRequest,
  ): Promise<WithError<VerifyEmailTokenResponse>> {
    const { guid, verificationToken } = verifyEmailTokenRequest;

    const userConfirmationToken =
      await this.prisma.userConfirmationToken.findFirst({
        where: { guid, verificationToken },
      });

    if (!userConfirmationToken) {
      throw new RpcException('No email with this code found.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userConfirmationToken.update({
        data: {
          isActive: false,
        },
        where: { guid },
      });

      await tx.user.update({
        data: { isActive: true },
        where: { guid },
      });
    });

    return { errors: null };
  }
}
