import { Role, Theme, User, User_Settings } from '@prisma/client';

export const batman: User = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: Role.APP_ADMIN,
  googleAuthId: 'b'
};

export const superman: User = {
  userId: 2,
  firstName: 'Clark',
  lastName: 'Kent',
  email: 'clark.kent@thedailyplanet.com',
  emailId: 'clark.kent',
  role: Role.ADMIN,
  googleAuthId: 's'
};

export const wonderwoman: User = {
  userId: 3,
  firstName: 'Wonder',
  lastName: 'Woman',
  email: 'amazonian1@savingtheday.com',
  emailId: 'amazonian1',
  role: Role.GUEST,
  googleAuthId: 'w'
};

export const flash: User = {
  userId: 4,
  firstName: 'Barry',
  lastName: 'Allen',
  email: 'b.allen@fast.com',
  emailId: 'barry.allen',
  role: Role.ADMIN,
  googleAuthId: 'b'
};

export const greenlantern: User = {
  userId: 5,
  firstName: 'Hal',
  lastName: 'Jordan',
  email: 'h.jordam@pilot.com',
  emailId: 'hal.jordan',
  role: Role.LEADERSHIP,
  googleAuthId: 'g'
};

export const aquaman: User = {
  userId: 6,
  firstName: 'Arthur',
  lastName: 'Curry',
  email: 'a.curry@water.com',
  emailId: 'arhur.curry',
  role: Role.LEADERSHIP,
  googleAuthId: 'a'
};

export const batmanSettings: User_Settings = {
  id: 'bm',
  userId: 1,
  defaultTheme: Theme.DARK,
  slackId: 'slack'
};
