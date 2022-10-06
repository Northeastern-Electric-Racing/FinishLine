/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Role } from '@prisma/client';

const dbSeedUser1: any = {
  firstName: 'Thomas',
  lastName: 'Emrax',
  googleAuthId: '1',
  email: 'emrax.t@husky.neu.edu',
  emailId: 'emrax.t',
  role: Role.APP_ADMIN
};

const dbSeedUser2: any = {
  firstName: 'Joe',
  lastName: 'Shmoe',
  googleAuthId: '2',
  email: 'shmoe.j@husky.neu.edu',
  emailId: 'shmoe.j',
  role: Role.ADMIN
};

const dbSeedUser3: any = {
  firstName: 'Joe',
  lastName: 'Blow',
  googleAuthId: '3',
  email: 'blow.j@husky.neu.edu',
  emailId: 'blow.j',
  role: Role.LEADERSHIP
};

const dbSeedUser4: any = {
  firstName: 'Amy',
  lastName: 'Smith',
  googleAuthId: '4',
  email: 'smith.a@husky.neu.edu',
  emailId: 'smith.a',
  role: Role.LEADERSHIP
};

const dbSeedUser5: any = {
  firstName: 'Rachel',
  lastName: 'Barmatha',
  googleAuthId: '5',
  email: 'barmatha.r@husky.neu.edu',
  emailId: 'barmatha.r',
  role: Role.MEMBER
};

const dbSeedUser6: any = {
  firstName: 'Emily',
  lastName: 'Bendara',
  googleAuthId: '6',
  email: 'bendara.e@husky.neu.edu',
  emailId: 'bendara.e',
  role: Role.MEMBER
};

const dbSeedUser7: any = {
  firstName: 'Jackson',
  lastName: 'James',
  googleAuthId: '7',
  email: 'james.j@gmail.com'
};

export const dbSeedAllUsers: any[] = [
  dbSeedUser1,
  dbSeedUser2,
  dbSeedUser3,
  dbSeedUser4,
  dbSeedUser5,
  dbSeedUser6,
  dbSeedUser7
];
