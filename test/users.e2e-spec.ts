import { INestApplication } from '@nestjs/common';
import { UsersController } from '@src/modules/users/users.controller';
import { applyFixtures } from './utils/applyFixtures';
import prisma from './client';
import { getUser, users } from './fixtures/users';
import { UserCreateInput, UserUpdateInput } from '@src/modules/users/dto';
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

      expect(errors).toBeNull();
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
        return controller.create(userInput);
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

  describe('Update user', function () {
    it('should return valid update user response', async function () {
      const existingUserMock = users[0];

      const input: UserUpdateInput = {
        email: existingUserMock.email,
        fullName: 'Updated User Fullname',
        phoneNumber: existingUserMock.phoneNumber,
      };

      const { result, errors } = await controller.update(input);

      expect(errors).toBeNull();
      // expect(result.guid).toBe(existingUserMock.guid)
      expect(result.email).toBe(existingUserMock.email);
      expect(result.fullName).toBe(input.fullName);
    });

    it('should throw error when updated user has same email as one of existing user', async function () {
      const existingUserMock = users[0];
      const userWithSameEmail = users[1];

      const input: UserUpdateInput = {
        email: userWithSameEmail.email,
        fullName: 'Updated User Fullname',
        phoneNumber: existingUserMock.phoneNumber,
      };

      expect(() => {
        return controller.update(input);
      }).toThrow(RpcException);
    });

    it('should throw error when updated user has same phone number as one of existing user', function () {
      const existingUserMock = users[0];
      const userWithSamePhoneNumber = users[1];

      const input: UserUpdateInput = {
        email: existingUserMock.email,
        fullName: 'Updated User Fullname',
        phoneNumber: userWithSamePhoneNumber.phoneNumber,
      };

      expect(() => {
        return controller.update(input);
      }).toThrow(RpcException);
    });

    it('should throw error when updated user doesnt exist in DB', function () {
      const userWithNoMatchInDb = getUser({
        guid: '66e33c1b-0000-4444-89db-56532322ac49',
        email: 'userwithnomatchindb@gmail.com',
      });

      const input: UserUpdateInput = {
        email: userWithNoMatchInDb.email,
        fullName: userWithNoMatchInDb.fullName,
        phoneNumber: userWithNoMatchInDb.phoneNumber,
      };

      expect(() => {
        return controller.update(input);
      }).toThrow(RpcException);
    });
  });
});
