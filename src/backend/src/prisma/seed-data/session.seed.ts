/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

const dbSeedSession1: any = {
  userId: 1,
  fields: {
    created: new Date('02/02/21 10:05 AM EST'),
    deviceInfo: 'iPhone X'
  }
};

const dbSeedSession2: any = {
  userId: 1,
  fields: {
    created: new Date('02/03/21 09:32 PM EST'),
    deviceInfo: 'Dell XPS'
  }
};

const dbSeedSession3: any = {
  userId: 1,
  fields: {
    created: new Date('02/05/21 12:57 PM EST')
  }
};

const dbSeedSession4: any = {
  userId: 2,
  fields: {
    created: new Date('02/10/21 06:09 AM EST'),
    deviceInfo: 'Samsung Galaxy S25'
  }
};

const dbSeedSession5: any = {
  userId: 2,
  fields: {
    created: new Date('02/13/21 09:15 AM EST'),
    deviceInfo: 'Lenovo Thinkpad'
  }
};

const dbSeedSession6: any = {
  userId: 3,
  fields: {
    created: new Date('02/16/21 04:20 PM EST'),
    deviceInfo: 'iPhone 16'
  }
};

const dbSeedSession7: any = {
  userId: 4,
  fields: {
    created: new Date('02/20/21 01:46 PM EST'),
    deviceInfo: 'Chromebook'
  }
};

const dbSeedSession8: any = {
  userId: 5,
  fields: {
    created: new Date('02/25/21 8:10 PM EST'),
    deviceInfo: 'iPhone SE'
  }
};

const dbSeedSession9: any = {
  userId: 5,
  fields: {
    created: new Date('02/27/21 10:37 PM EST'),
    deviceInfo: 'iPad Pro'
  }
};

const dbSeedSession10: any = {
  userId: 7,
  fields: {
    created: new Date('02/28/21 04:20 AM EST'),
    deviceInfo: 'FBI Surveillance Van'
  }
};

export const dbSeedAllSessions: any[] = [
  dbSeedSession1,
  dbSeedSession2,
  dbSeedSession3,
  dbSeedSession4,
  dbSeedSession5,
  dbSeedSession6,
  dbSeedSession7,
  dbSeedSession8,
  dbSeedSession9,
  dbSeedSession10
];
