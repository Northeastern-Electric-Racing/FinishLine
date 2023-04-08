import { Role as PrismaRole, Theme, User as PrismaUser, User_Settings } from '@prisma/client';
import { User as SharedUser } from 'shared';

export const batman: PrismaUser = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: PrismaRole.APP_ADMIN,
  googleAuthId: 'b'
};

export const theVisitor: PrismaUser = {
  userId: 7,
  firstName: 'The',
  lastName: 'Visitor',
  email: 'oooscary@gmail.com',
  emailId: 'oooscary',
  role: PrismaRole.GUEST,
  googleAuthId: 't'
};

export const superman: PrismaUser = {
  userId: 2,
  firstName: 'Clark',
  lastName: 'Kent',
  email: 'clark.kent@thedailyplanet.com',
  emailId: 'clark.kent',
  role: PrismaRole.ADMIN,
  googleAuthId: 's'
};

export const wonderwoman: PrismaUser = {
  userId: 3,
  firstName: 'Wonder',
  lastName: 'Woman',
  email: 'amazonian1@savingtheday.com',
  emailId: 'amazonian1',
  role: PrismaRole.GUEST,
  googleAuthId: 'w'
};

export const flash: PrismaUser = {
  userId: 4,
  firstName: 'Barry',
  lastName: 'Allen',
  email: 'b.allen@fast.com',
  emailId: 'barry.allen',
  role: PrismaRole.ADMIN,
  googleAuthId: 'f'
};

export const greenlantern: PrismaUser = {
  userId: 5,
  firstName: 'Hal',
  lastName: 'Jordan',
  email: 'h.jordam@pilot.com',
  emailId: 'hal.jordan',
  role: PrismaRole.HEAD,
  googleAuthId: 'g'
};

export const aquaman: PrismaUser = {
  userId: 6,
  firstName: 'Arthur',
  lastName: 'Curry',
  email: 'a.curry@water.com',
  emailId: 'arhur.curry',
  role: PrismaRole.LEADERSHIP,
  googleAuthId: 'a'
};

export const batmanSettings: User_Settings = {
  id: 'bm',
  userId: 1,
  defaultTheme: Theme.DARK,
  slackId: 'slack'
};

export const sharedUser1: SharedUser = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: 'APP_ADMIN'
};
