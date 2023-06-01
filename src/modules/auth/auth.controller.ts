import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  VerifyEmailTokenRequest,
  SignUpRequest,
  SignInRequest,
  SignUpResponse,
  SignInResponse,
  VerifyEmailTokenResponse,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from '@src/decorators/auth-public.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @GrpcMethod('AuthService', 'SignUp')
  async signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
    const { errors } = await this.authService.signUp(signUpRequest);

    return { errors };
  }

  @Public()
  @GrpcMethod('AuthService', 'SignIn')
  async signIn(signInRequest: SignInRequest): Promise<SignInResponse> {
    const { result, errors } = await this.authService.signIn(signInRequest);

    return { result, errors };
  }

  @Public()
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
