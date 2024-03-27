import {
  Role as PrismaRole,
  Theme,
  User as PrismaUser,
  User_Settings,
  User_Secure_Settings,
  Team,
  Schedule_Settings
} from '@prisma/client';
import { User as SharedUser, UserScheduleSettings } from 'shared';

export const thomasEmrax: PrismaUser = {
  userId: 1,
  firstName: 'Thomas',
  lastName: 'Emrax',
  email: 'emrax.t@husky.neu.edu',
  emailId: null,
  role: PrismaRole.APP_ADMIN,
  googleAuthId: '1'
};

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

export const supermanSettings: User_Settings = {
  id: 'sm',
  userId: 2,
  defaultTheme: Theme.LIGHT,
  slackId: 'slackSM'
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

export const sharedBatman: SharedUser = {
  userId: 1,
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: 'APP_ADMIN'
};

export const batmanSecureSettings: User_Secure_Settings = {
  userSecureSettingsId: 'bm',
  userId: 1,
  nuid: '001234567',
  phoneNumber: '1234567890',
  street: '123 Gotham St.',
  city: 'Gotham',
  state: 'NY',
  zipcode: '12345'
};

export const alfred: PrismaUser & { teamsAsMember: Team[]; teamsAsLead: Team[] } = {
  userId: 10,
  firstName: 'Alfred',
  lastName: 'Pennyworth',
  email: 'butler@gmail.com',
  emailId: 'butler',
  role: PrismaRole.APP_ADMIN,
  googleAuthId: 'u',
  // Do NOT put a team here! This will create a circular dependency that breaks tests.
  // Do this instead: { ...alfred, teamsAsMember: [<your team>]}
  teamsAsMember: [],
  teamsAsLead: []
};

export const batmanWithUserSettings: PrismaUser & { userSettings: User_Settings } = {
  ...batman,
  userSettings: {
    ...batmanSettings
  }
};

export const supermanWithUserSettings: PrismaUser & { userSettings: User_Settings } = {
  ...superman,
  userSettings: {
    ...supermanSettings
  }
};

export const batmanScheduleSettings: Schedule_Settings = {
  drScheduleSettingsId: 'bmschedule',
  personalGmail: 'brucewayne@gmail.com',
  personalZoomLink: 'https://zoom.us/j/gotham',
  availability: [],
  userId: 69
};

export const batmanWithScheduleSettings: PrismaUser & { scheduleSettings: Schedule_Settings } = {
  ...batman,
  scheduleSettings: {
    ...batmanScheduleSettings
  }
};

export const batmanUserScheduleSettings: UserScheduleSettings = {
  drScheduleSettingsId: 'bmschedule',
  personalGmail: 'brucewayne@gmail.com',
  personalZoomLink: 'https://zoom.us/j/gotham',
  availability: []
};

export const wonderwomanScheduleSettings: Schedule_Settings = {
  drScheduleSettingsId: 'wwschedule',
  personalGmail: 'diana@gmail.com',
  personalZoomLink: 'https://zoom.us/jk/athens',
  availability: [3],
  userId: 72
};

export const wonderwomanMarkedScheduleSettings: Schedule_Settings = {
  drScheduleSettingsId: 'wwschedule',
  personalGmail: 'diana@gmail.com',
  personalZoomLink: 'https://zoom.us/jk/athens',
  availability: [1, 2],
  userId: 72
};

export const wonderwomanWithScheduleSettings: PrismaUser & { scheduleSettings: Schedule_Settings } = {
  ...wonderwoman,
  scheduleSettings: {
    ...wonderwomanScheduleSettings
  }
};

export const wonderwomanMarkedWithScheduleSettings: PrismaUser & { scheduleSettings: Schedule_Settings } = {
  ...wonderwoman,
  scheduleSettings: {
    ...wonderwomanMarkedScheduleSettings
  }
};
