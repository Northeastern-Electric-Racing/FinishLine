import { Theme, User_Settings, User_Secure_Settings, Team, Schedule_Settings } from '@prisma/client';
import { RoleEnum, User as SharedUser, UserScheduleSettings } from 'shared';
import { CreateTestUserParams } from '../test-utils';

export const batmanAppAdmin: CreateTestUserParams = {
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: RoleEnum.APP_ADMIN,
  googleAuthId: 'b'
};

export const theVisitorGuest: CreateTestUserParams = {
  firstName: 'The',
  lastName: 'Visitor',
  email: 'oooscary@gmail.com',
  emailId: 'oooscary',
  role: RoleEnum.GUEST,
  googleAuthId: 't'
};

export const supermanAdmin: CreateTestUserParams = {
  firstName: 'Clark',
  lastName: 'Kent',
  email: 'clark.kent@thedailyplanet.com',
  emailId: 'clark.kent',
  role: RoleEnum.ADMIN,
  googleAuthId: 's'
};

export const supermanSettings: User_Settings = {
  id: 'sm',
  userId: '2',
  defaultTheme: Theme.LIGHT,
  slackId: 'slackSM'
};

export const wonderwomanGuest: CreateTestUserParams = {
  firstName: 'Wonder',
  lastName: 'Woman',
  email: 'amazonian1@savingtheday.com',
  emailId: 'amazonian1',
  role: RoleEnum.GUEST,
  googleAuthId: 'w'
};

export const wonderwomanSettings: User_Settings = {
  id: 'ww',
  userId: '4',
  defaultTheme: Theme.LIGHT,
  slackId: 'slackWW'
};

export const flashAdmin: CreateTestUserParams = {
  firstName: 'Barry',
  lastName: 'Allen',
  email: 'b.allen@fast.com',
  emailId: 'barry.allen',
  role: RoleEnum.ADMIN,
  googleAuthId: 'f'
};

export const greenlanternHead: CreateTestUserParams = {
  firstName: 'Hal',
  lastName: 'Jordan',
  email: 'h.jordam@pilot.com',
  emailId: 'hal.jordan',
  role: RoleEnum.HEAD,
  googleAuthId: 'g'
};

export const aquamanLeadership: CreateTestUserParams = {
  firstName: 'Arthur',
  lastName: 'Curry',
  email: 'a.curry@water.com',
  emailId: 'arhur.curry',
  role: RoleEnum.LEADERSHIP,
  googleAuthId: 'a'
};

export const financeMember: CreateTestUserParams = {
  firstName: 'Johnny',
  lastName: 'Bravo',
  googleAuthId: '25',
  email: 'jbravo@gmail.com',
  emailId: 'jbravo',
  role: RoleEnum.MEMBER
};

export const member: CreateTestUserParams = {
  firstName: 'Johnny',
  lastName: 'Bravo',
  googleAuthId: '25',
  email: 'jbravo@gmail.com',
  emailId: 'jbravo',
  role: RoleEnum.MEMBER
};

export const batmanSettings: User_Settings = {
  id: 'bm',
  userId: '1',
  defaultTheme: Theme.DARK,
  slackId: 'slack'
};

export const sharedBatman: SharedUser = {
  userId: '1',
  firstName: 'Bruce',
  lastName: 'Wayne',
  email: 'notbatman@gmail.com',
  emailId: 'notbatman',
  role: 'APP_ADMIN'
};

export const batmanSecureSettings: User_Secure_Settings = {
  userSecureSettingsId: 'bm',
  userId: '1',
  nuid: '001234567',
  phoneNumber: '1234567890',
  street: '123 Gotham St.',
  city: 'Gotham',
  state: 'NY',
  zipcode: '12345'
};

export const alfred: CreateTestUserParams & { teamsAsMember: Team[]; teamsAsLead: Team[] } = {
  firstName: 'Alfred',
  lastName: 'Pennyworth',
  email: 'butler@gmail.com',
  emailId: 'butler',
  role: RoleEnum.APP_ADMIN,
  googleAuthId: 'u',
  // Do NOT put a team here! This will create a circular dependency that breaks tests.
  // Do this instead: { ...alfred, teamsAsMember: [<your team>]}
  teamsAsMember: [],
  teamsAsLead: []
};

export const batmanWithUserSettings: CreateTestUserParams & { userSettings: User_Settings } = {
  ...batmanAppAdmin,
  userSettings: {
    ...batmanSettings
  }
};

export const supermanWithUserSettings: CreateTestUserParams & { userSettings: User_Settings } = {
  ...supermanAdmin,
  userSettings: {
    ...supermanSettings
  }
};

export const batmanScheduleSettings: Schedule_Settings = {
  drScheduleSettingsId: 'bmschedule',
  personalGmail: 'brucewayne@gmail.com',
  personalZoomLink: 'https://zoom.us/j/gotham',
  userId: '69'
};

export const batmanWithScheduleSettings: CreateTestUserParams & { scheduleSettings: Schedule_Settings } = {
  ...batmanAppAdmin,
  scheduleSettings: {
    ...batmanScheduleSettings
  }
};

export const batmanUserScheduleSettings: UserScheduleSettings = {
  drScheduleSettingsId: 'bmschedule',
  personalGmail: 'brucewayne@gmail.com',
  personalZoomLink: 'https://zoom.us/j/gotham',
  availabilities: []
};

export const wonderwomanScheduleSettings: Schedule_Settings = {
  drScheduleSettingsId: 'wwschedule',
  personalGmail: 'diana@gmail.com',
  personalZoomLink: 'https://zoom.us/jk/athens',
  userId: '72'
};

export const wonderwomanMarkedScheduleSettings: Schedule_Settings = {
  drScheduleSettingsId: 'wwschedule',
  personalGmail: 'diana@gmail.com',
  personalZoomLink: 'https://zoom.us/jk/athens',
  userId: '72'
};

export const wonderwomanWithScheduleSettings: CreateTestUserParams & { scheduleSettings: Schedule_Settings } = {
  ...wonderwomanGuest,
  scheduleSettings: {
    ...wonderwomanScheduleSettings
  }
};

export const wonderwomanMarkedWithScheduleSettings: CreateTestUserParams & { scheduleSettings: Schedule_Settings } = {
  ...wonderwomanGuest,
  scheduleSettings: {
    ...wonderwomanMarkedScheduleSettings
  }
};
