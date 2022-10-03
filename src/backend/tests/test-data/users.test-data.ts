import { Role } from '@prisma/client';

export const batman = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: Role.APP_ADMIN,
  googleAuthId: 'b'
};

export const superman = {
  userId: 2,
  firstName: 'Clark',
  lastName: 'Kent',
  email: 'clark.kent@thedailyplanet.com',
  emailId: 'clark.kent',
  role: Role.ADMIN,
  googleAuthId: 's'
};

export const guestUser = {
  userId: 3,
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: Role.GUEST,
  googleAuthId: 'b'
};
