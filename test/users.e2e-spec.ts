import { INestApplication } from '@nestjs/common';
import { UsersController } from '@src/modules/users/users.controller';
import { applyFixtures } from './utils/applyFixtures';
import prisma from './client';
import { getUser, users } from './fixtures/users';
import {
  UserCreateInput,
  UserDeleteInput,
  UserDetailInput,
  UserListRequest,
  UserUpdateInput,
} from '@src/modules/users/dto';
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
        avatar: null,
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
        avatar: null,
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
        avatar: null,
      };

      expect(() => {
        return controller.create(userInput);
      }).toThrow(RpcException);
    });
  });

  describe('Update user', function () {
    it('should return valid update user response', async function () {
      const existingUserMock = users[0];

      const input: UserUpdateInput = {
        guid: existingUserMock.guid,
        email: existingUserMock.email,
        fullName: 'Updated User Fullname',
        phoneNumber: existingUserMock.phoneNumber,
        avatar: null,
      };

      const { result, errors } = await controller.update(input);

      expect(errors).toBeNull();
      expect(result.guid).toBe(existingUserMock.guid);
      expect(result.email).toBe(existingUserMock.email);
      expect(result.fullName).toBe(input.fullName);
    });

    it('should throw error when updated user has same email as one of existing user', async function () {
      const existingUserMock = users[0];
      const userWithSameEmail = users[1];

      const input: UserUpdateInput = {
        guid: existingUserMock.guid,
        email: userWithSameEmail.email,
        fullName: 'Updated User Fullname',
        phoneNumber: existingUserMock.phoneNumber,
        avatar: null,
      };

      expect(() => {
        return controller.update(input);
      }).toThrow(RpcException);
    });

    it('should throw error when updated user has same phone number as one of existing user', function () {
      const existingUserMock = users[0];
      const userWithSamePhoneNumber = users[1];

      const input: UserUpdateInput = {
        guid: existingUserMock.guid,
        email: existingUserMock.email,
        fullName: 'Updated User Fullname',
        phoneNumber: userWithSamePhoneNumber.phoneNumber,
        avatar: null,
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
        guid: userWithNoMatchInDb.guid,
        email: userWithNoMatchInDb.email,
        fullName: userWithNoMatchInDb.fullName,
        phoneNumber: userWithNoMatchInDb.phoneNumber,
        avatar: null,
      };

      expect(() => {
        return controller.update(input);
      }).toThrow(RpcException);
    });
  });

  describe('Get users list', function () {
    it('should return valid response with users', async function () {
      const listInput: UserListRequest = {
        options: {
          filter: null,
          limit: null,
          ordering: null,
          page: 1,
          search: null,
        },
      };

      const { results, count, errors } = await controller.list(listInput);

      const expectedUsersCount = users.length;
      expect(errors).toBeNull();
      expect(results.length).toBe(expectedUsersCount);
      expect(count).toBe(expectedUsersCount);
    });

    it('should return valid response with users when limit is set', async function () {
      const listInput: UserListRequest = {
        options: {
          filter: null,
          limit: 1,
          ordering: null,
          page: 1,
          search: null,
        },
      };

      const { results, count, errors } = await controller.list(listInput);

      const expectedUsersCount = 1;
      expect(errors).toBeNull();
      expect(results.length).toBe(expectedUsersCount);
      expect(count).toBe(expectedUsersCount);
    });
  });

  describe('Get user details', function () {
    it('should return valid response with details of user', async function () {
      const existingUserMock = users[0];
      const detailRequest: UserDetailInput = {
        guid: existingUserMock.guid,
      };

      const { result } = await controller.detail(detailRequest);

      expect(result.guid).toBe(existingUserMock.guid);
      expect(result.email).toBe(existingUserMock.email);
      expect(result.fullName).toBe(existingUserMock.fullName);
    });

    it('should throw error when there is no user with such guid', function () {
      const userWithNoMatchInDb = getUser({
        guid: 'af00000f-0000-1111-0000-e42e00005e7b',
      });
      const detailRequest: UserDetailInput = {
        guid: userWithNoMatchInDb.guid,
      };

      expect(() => {
        return controller.detail(detailRequest);
      }).toThrow(RpcException);
    });
  });

  describe('Delete user', function () {
    it('should return valid response with deleted user', async function () {
      const existingUserMock = users[0];
      const deleteRequest: UserDeleteInput = {
        guid: existingUserMock.guid,
      };

      const { result, errors } = await controller.delete(deleteRequest);

      expect(errors).toBeNull();
      expect(result.guid).toBe(existingUserMock.guid);
    });

    it('should throw error when there is no user to delete', function () {
      const notExistingUser = getUser({
        guid: 'af00000f-0000-0000-0000-e42e00005e7b',
        email: 'notexisting@gmail.com',
      });
      const deleteRequest: UserDeleteInput = {
        guid: notExistingUser.guid,
      };

      expect(() => {
        return controller.delete(deleteRequest);
      }).toThrow(RpcException);
    });
  });
});
