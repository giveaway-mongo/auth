import { INestApplication } from '@nestjs/common';
import { UsersController } from '@src/modules/users/users.controller';
import { applyFixtures } from './utils/applyFixtures';
import prisma from './client';
import { getUser, users } from './fixtures/users';
import { UserCreateInput } from '@src/modules/users/dto';
import { RpcException } from '@nestjs/microservices';

describe('UsersController (e2e)', function () {
  let app: INestApplication;
  let controller: UsersController;

  beforeEach(async function () {
    app = (global as any).app;
    controller = app.get<UsersController>(UsersController);

    await applyFixtures(users, prisma.user);
  });

  describe('Create user', function () {
    it('should return valid create user response', async function () {
      const userMock = getUser({
        guid: '66e33c1b-938a-4444-89db-56532322ac49',
        email: 'newuser@gmail.uz',
        fullName: 'New User',
      });

      const input: UserCreateInput = {
        email: userMock.email,
        password: userMock.password,
        fullName: userMock.fullName,
        phoneNumber: userMock.phoneNumber,
        role: '',
      };
      const { result, errors } = await controller.create(input);

      expect(errors).toEqual(null);
      expect(result.email).toBe(userMock.email);
    });

    it('should throw error when user with the same email has been already registered', function () {
      const existingUser = users[0];
      const userToCreate = getUser({
        ...existingUser,
        guid: '66e33c1b-938a-new1-89db-56532322ac49',
        fullName: 'New user',
        email: existingUser.email,
        phoneNumber: '+99899999123123',
      });

      const userInput: UserCreateInput = {
        email: userToCreate.email,
        password: userToCreate.password,
        fullName: userToCreate.fullName,
        phoneNumber: userToCreate.phoneNumber,
        role: '',
      };

      expect(() => {
        controller.create(userInput);
      }).toThrow(RpcException);
    });

    it('should throw error when user with the same phone number has been already registered', function () {
      const existingUser = users[0];
      const userToCreate = getUser({
        ...existingUser,
        guid: '66e33c1b-938a-new1-89db-56532322ac49',
        fullName: 'New user',
        email: 'newuseremail@gmail.com',
        phoneNumber: existingUser.phoneNumber,
      });

      const userInput: UserCreateInput = {
        email: userToCreate.email,
        password: userToCreate.password,
        fullName: userToCreate.fullName,
        phoneNumber: userToCreate.phoneNumber,
        role: '',
      };

      expect(() => {
        controller.create(userInput);
      }).toThrow(RpcException);
    });
  });
});
