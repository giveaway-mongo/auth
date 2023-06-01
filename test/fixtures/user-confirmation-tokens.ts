import { Prisma } from '@prisma/generated';

export const userConfirmationTokens: Prisma.UserConfirmationTokenCreateInput[] =
  [
    {
      // id: '507f191e810c19729de860ea',
      verificationToken: 'aaaa-aaaa-aaaa-aaaa-56532322ac49',
      guid: '66e33c1b-938a-497b-89db-56532322ac49',
      email: 'test_email@gmail.com',
      isActive: true,
    },
  ];
