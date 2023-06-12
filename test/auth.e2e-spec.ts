import { INestApplication } from '@nestjs/common';
import { AuthController } from '@src/modules/auth/auth.controller';
import prisma from './client';
import { users } from './fixtures/users';
import { applyFixtures } from './utils/applyFixtures';
import { userConfirmationTokens } from './fixtures/user-confirmation-tokens';
import { SignUpRequest } from '@protogen/auth/auth';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let controller: AuthController;

  beforeEach(async () => {
    app = (global as any).app;
    controller = app.get<AuthController>(AuthController);

    await applyFixtures(users, prisma.user);
    await applyFixtures(userConfirmationTokens, prisma.userConfirmationToken);
  });

  it('signs up', async () => {
    const user: SignUpRequest = {
      email: 'some-email@test.com',
      phoneNumber: '+9989888888888',
      fullName: 'Test Testerov',
      password: 'Test1234',
    };

    const response = await controller.signUp(user);

    expect(response.errors.fieldErrors).toEqual(0);
  });

  it('signs in', async () => {
    const user = {
      email: 'test_email@gmail.com',
      password: 'Test12345',
    };

    const response = await controller.signIn(user);

    const result = response.result;

    expect(result.email).toEqual(user.email);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toEqual('');
  });

  it('verifies the email token', async () => {
    const request = {
      guid: '66e33c1b-938a-497b-89db-56532322ac49',
      verificationToken: 'aaaa-aaaa-aaaa-aaaa-56532322ac49',
    };

    try {
      await controller.verifyEmailToken(request);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('errors invalid email login', async () => {
    const user = {
      email: 'test_email@gmail.com',
      password: 'test12345',
    };

    try {
      await controller.signIn(user);
    } catch (errors) {
      expect(errors).toBeInstanceOf(Error);
    }
  });
});
