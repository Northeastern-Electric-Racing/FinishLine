/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma, Role, Theme } from '@prisma/client';

const thomasEmrax: Prisma.UserCreateInput = {
  firstName: 'Thomas',
  lastName: 'Emrax',
  googleAuthId: '1',
  email: 'emrax.t@husky.neu.edu',
  emailId: 'emrax.t',
  role: Role.APP_ADMIN,
  userSettings: {
    create: {
      defaultTheme: Theme.DARK,
      slackId: 'emrax'
    }
  }
};

const joeShmoe: Prisma.UserCreateInput = {
  firstName: 'Joe',
  lastName: 'Shmoe',
  googleAuthId: '2',
  email: 'shmoe.j@husky.neu.edu',
  emailId: 'shmoe.j',
  role: Role.ADMIN,
  userSettings: {
    create: {
      defaultTheme: Theme.LIGHT,
      slackId: 'asdf'
    }
  }
};

const joeBlow: Prisma.UserCreateInput = {
  firstName: 'Joe',
  lastName: 'Blow',
  googleAuthId: '3',
  email: 'blow.j@husky.neu.edu',
  emailId: 'blow.j',
  role: Role.LEADERSHIP,
  userSettings: {
    create: {
      defaultTheme: Theme.DARK,
      slackId: 'blow'
    }
  }
};

const amySmith: Prisma.UserCreateInput = {
  firstName: 'Amy',
  lastName: 'Smith',
  googleAuthId: '4',
  email: 'smith.a@husky.neu.edu',
  emailId: 'smith.a',
  role: Role.LEADERSHIP,
  userSettings: {
    create: {
      defaultTheme: Theme.DARK
    }
  }
};

const rachelBarmatha: Prisma.UserCreateInput = {
  firstName: 'Rachel',
  lastName: 'Barmatha',
  googleAuthId: '5',
  email: 'barmatha.r@husky.neu.edu',
  emailId: 'barmatha.r',
  role: Role.MEMBER,
  userSettings: {
    create: {
      defaultTheme: Theme.DARK
    }
  }
};

const emilyBendara: Prisma.UserCreateInput = {
  firstName: 'Emily',
  lastName: 'Bendara',
  googleAuthId: '6',
  email: 'bendara.e@husky.neu.edu',
  emailId: 'bendara.e',
  role: Role.MEMBER,
  userSettings: {
    create: {
      defaultTheme: Theme.DARK
    }
  }
};

const jacksonJames: Prisma.UserCreateInput = {
  firstName: 'Jackson',
  lastName: 'James',
  googleAuthId: '7',
  email: 'james.j@gmail.com',
  userSettings: {
    create: {
      defaultTheme: Theme.DARK
    }
  }
};

const batman: Prisma.UserCreateInput = {
  firstName: 'Bruce',
  lastName: 'Wayne',
  googleAuthId: 'im batman',
  email: 'notbatman@brucewayne.com',
  emailId: 'notbatman',
  role: Role.APP_ADMIN,
  userSettings: {
    create: {
      defaultTheme: Theme.DARK,
      slackId: 'batman'
    }
  }
};

const superman: Prisma.UserCreateInput = {
  firstName: 'Clark',
  lastName: 'Kent',
  email: 'clark.kent@thedailyplanet.com',
  emailId: 'clark.kent',
  role: Role.ADMIN,
  googleAuthId: 'superman',
  userSettings: {
    create: {
      defaultTheme: Theme.LIGHT,
      slackId: 'superman'
    }
  }
};

const wonderwoman: Prisma.UserCreateInput = {
  firstName: 'Wonder',
  lastName: 'Woman',
  email: 'amazonian1@savingtheday.com',
  emailId: 'amazonian1',
  role: Role.GUEST,
  googleAuthId: 'wonderwoman'
};

export const dbSeedAllUsers: Prisma.UserCreateInput[] = [
  thomasEmrax,
  joeShmoe,
  joeBlow,
  amySmith,
  rachelBarmatha,
  emilyBendara,
  jacksonJames,
  batman,
  superman,
  wonderwoman
];
