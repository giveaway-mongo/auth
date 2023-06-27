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
import { sendEmail } from '@src/utils/mailjet';

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

    await this.prisma.$transaction(async (tx) => {
      const guid = generateGuid();
      const verificationToken = generateGuid();

      await tx.user.create({
        data: {
          guid,
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
          guid,
          verificationToken,
        },
      });

      const message = `<h1>This is your code: <a href="http://allgiveaway.uz/?guid=${guid}&verificationToken=${verificationToken}">Click here</a></h1>`;
      const result = await sendEmail({
        targetEmail: email,
        subject: 'Verification code',
        message,
      });
      console.log(JSON.stringify(result.body));
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
