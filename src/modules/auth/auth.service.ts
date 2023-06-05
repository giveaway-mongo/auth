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
      //   give error by standard
      throw Error('Email already exists.');
    }

    // send email

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

    return { errors: [] };
  }

  async signIn(
    signInRequest: SignInRequest,
  ): Promise<WithError<SignInResponse>> {
    const { email, password } = signInRequest;

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      // Add error
      throw Error('User does not exist');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      //   Add error
      throw Error('Incorrect password.');
    }

    const payload = {
      guid: user.guid,
    };

    const accessToken = this.jwtService.sign(payload);

    return { result: { email, accessToken, refreshToken: '' }, errors: [] };
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
      throw Error('No email with this code found.');
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

    return { errors: [] };
  }
}
