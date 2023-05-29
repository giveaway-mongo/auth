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
import { PrismaClient } from '@prisma/generated';
import { generateGuid } from '@common/utils/generate-guid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaClient,
  ) {}

  async signUp(
    signUpRequest: SignUpRequest,
  ): Promise<WithError<SignUpResponse>> {
    const { email, password, fullName, phoneNumber } = signUpRequest;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      //   give error
      return;
    }

    await this.prisma.user.create({
      data: {
        guid: generateGuid(),
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
      },
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
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      //   Add error
      return;
    }

    return { email, errors: [] };
  }

  async verifyEmailToken(
    verifyEmailTokenRequest: VerifyEmailTokenRequest,
  ): Promise<WithError<VerifyEmailTokenResponse>> {
    return { errors: [] };
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
