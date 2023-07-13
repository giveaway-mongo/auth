import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  VerifyEmailTokenRequest,
  VerifyEmailTokenResponse,
} from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @GrpcMethod('AuthService', 'SignUp')
  async signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
    const { result, errors } = await this.authService.signUp(signUpRequest);

    return { result, errors };
  }

  @GrpcMethod('AuthService', 'SignIn')
  async signIn(signInRequest: SignInRequest): Promise<SignInResponse> {
    const { result, errors } = await this.authService.signIn(signInRequest);

    return { result, errors };
  }

  @GrpcMethod('AuthService', 'VerifyEmailToken')
  async verifyEmailToken(
    verifyEmailTokenRequest: VerifyEmailTokenRequest,
  ): Promise<VerifyEmailTokenResponse> {
    const { errors } = await this.authService.verifyEmailToken(
      verifyEmailTokenRequest,
    );

    return { errors };
  }
}
