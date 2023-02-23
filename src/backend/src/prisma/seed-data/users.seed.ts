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

const wonderwoman: Prisma.UserCreateInput = {
  firstName: 'Diana',
  lastName: 'Prince',
  email: 'wonderwoman@justiceleague.com',
  emailId: 'wonderwoman',
  role: Role.LEADERSHIP,
  googleAuthId: 'wonderwoman'
};

const flash: Prisma.UserCreateInput = {
  firstName: 'Barry',
  lastName: 'Allen',
  googleAuthId: 'flaaaash',
  email: 'flash@starlabs.edu',
  emailId: 'barry.allen',
  role: Role.MEMBER
};

const aquaman: Prisma.UserCreateInput = {
  firstName: 'Arthur',
  lastName: 'Curry',
  googleAuthId: 'fish',
  email: 'aquaman@gmail.com',
  emailId: 'thefishman',
  role: Role.MEMBER
};

const robin: Prisma.UserCreateInput = {
  firstName: 'Damien',
  lastName: 'Wayne',
  googleAuthId: 'robin',
  email: 'robin4@brucewayne.com',
  role: Role.GUEST
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
  email: 'superman@thedailyplanet.com',
  role: Role.ADMIN,
  googleAuthId: 'superman',
  userSettings: {
    create: {
      defaultTheme: Theme.LIGHT,
      slackId: 'superman'
    }
  }
};

const cyborg: Prisma.UserCreateInput = {
  firstName: 'Vic',
  lastName: 'Stone',
  email: 'cyborg@justiceleague.com',
  googleAuthId: 'beepboop',
  role: Role.APP_ADMIN
};

const martianManhunter: Prisma.UserCreateInput = {
  firstName: `J'onn`,
  lastName: `J'onnz`,
  email: 'martian.manhunter@justiceleague.com',
  googleAuthId: 'martian',
  role: Role.LEADERSHIP
};

const greenLantern: Prisma.UserCreateInput = {
  firstName: 'Hal',
  lastName: 'Jordan',
  email: 'greenlantern1@justiceleague.com',
  googleAuthId: 'green',
  role: Role.MEMBER
};

const hawkMan: Prisma.UserCreateInput = {
  firstName: 'Hawk',
  lastName: 'Man',
  email: 'hawkman@justiceleague.com',
  googleAuthId: 'cawwwww',
  role: Role.MEMBER
};

const hawkWoman: Prisma.UserCreateInput = {
  firstName: 'Hawk',
  lastName: 'Woman',
  email: 'hawkwoman@justiceleague.com',
  googleAuthId: 'cacawwwww',
  role: Role.MEMBER
};

const nightwing: Prisma.UserCreateInput = {
  firstName: 'Dick',
  lastName: 'Grayson',
  email: 'robin1@brucewayne.com',
  googleAuthId: 'robin1',
  role: Role.GUEST
};

const brandonHyde: Prisma.UserCreateInput = {
  firstName: 'Brandon',
  lastName: 'Hyde',
  email: 'brandon.hyde@orioles.com',
  googleAuthId: 'letsgoOs',
  role: Role.LEADERSHIP
};

const calRipken: Prisma.UserCreateInput = {
  firstName: 'Cal',
  lastName: 'Ripken',
  email: 'cal.ripken@orioles.com',
  googleAuthId: 'ooooos',
  role: Role.LEADERSHIP
};

const adleyRutschman: Prisma.UserCreateInput = {
  firstName: 'Adley',
  lastName: 'Rutschman',
  email: 'adley.rutschman@orioles.com',
  googleAuthId: 'catchin',
  role: Role.MEMBER
};

const johnHarbaugh: Prisma.UserCreateInput = {
  firstName: 'John',
  lastName: 'Harbaugh',
  email: 'john.harbaugh@ravens.com',
  googleAuthId: 'hcjh',
  role: Role.ADMIN
};

const lamarJackson: Prisma.UserCreateInput = {
  firstName: 'Lamar',
  lastName: 'Jackson',
  email: 'lamar.jackson@ravens.com',
  googleAuthId: 'lj8',
  role: Role.LEADERSHIP
};

export const dbSeedAllUsers = {
  thomasEmrax,
  joeShmoe,
  joeBlow,
  wonderwoman,
  flash,
  aquaman,
  robin,
  batman,
  superman,
  hawkMan,
  hawkWoman,
  cyborg,
  greenLantern,
  martianManhunter,
  nightwing,
  brandonHyde,
  calRipken,
  adleyRutschman,
  johnHarbaugh,
  lamarJackson
};
