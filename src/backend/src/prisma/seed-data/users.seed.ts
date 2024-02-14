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
  },
  userSecureSettings: {
    create: {
      phoneNumber: '1234567890',
      nuid: '12345678',
      city: 'Boston',
      state: 'MA',
      street: '1234 Street',
      zipcode: '12345'
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

const lexLuther: Prisma.UserCreateInput = {
  firstName: 'Alexander',
  lastName: 'Luther',
  email: 'lexluther@justiceleague.com',
  googleAuthId: 'hjkklo',
  role: Role.MEMBER
};

const hawkgirl: Prisma.UserCreateInput = {
  firstName: 'Shiera',
  lastName: 'Hall',
  email: 'hawkgirl@justiceleague.com',
  googleAuthId: 'bhuujki',
  role: Role.MEMBER
};

const elongatedMan: Prisma.UserCreateInput = {
  firstName: 'Randolph',
  lastName: 'Dibney',
  email: 'elongatedmangit @justiceleague.com',
  googleAuthId: 'joigiug',
  role: Role.MEMBER
};

const zatanna: Prisma.UserCreateInput = {
  firstName: 'Zatanna',
  lastName: 'Zatara',
  email: 'zatanna@justiceleague.com',
  googleAuthId: 'cawwww',
  role: Role.MEMBER
};

const phantomStranger: Prisma.UserCreateInput = {
  firstName: 'Judas',
  lastName: 'Iscariot',
  email: 'phantomstranger@justiceleague.com',
  googleAuthId: 'bnhjiuy',
  role: Role.MEMBER
};

const redTornado: Prisma.UserCreateInput = {
  firstName: 'Red',
  lastName: 'Tornado',
  email: 'redtornado@justiceleague.com',
  googleAuthId: 'vbnhught',
  role: Role.MEMBER
};

const firestorm: Prisma.UserCreateInput = {
  firstName: 'Ronnie',
  lastName: 'Raymond',
  email: 'firestorm@justiceleague.com',
  googleAuthId: 'fghttyu',
  role: Role.MEMBER
};

const hankHeywood: Prisma.UserCreateInput = {
  firstName: 'Hank',
  lastName: 'Heywood III',
  email: 'hankheywood@justiceleague.com',
  googleAuthId: 'hudhsgf',
  role: Role.MEMBER
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

const nezamJazayeri: Prisma.UserCreateInput = {
  firstName: 'Nezam',
  lastName: 'Jazayeri',
  email: 'nezam.jazayeri@steakman.com',
  googleAuthId: 'strip',
  role: Role.HEAD
};

const ryanHowe: Prisma.UserCreateInput = {
  firstName: 'Ryan',
  lastName: 'Howe',
  email: 'howeryan@smoothie.com',
  googleAuthId: 'ribeye',
  role: Role.HEAD
};

const jkDobbins: Prisma.UserCreateInput = {
  firstName: 'J.K',
  lastName: 'Dobbins',
  email: 'Dobbins.j.k@ravens.com',
  googleAuthId: 'ravensRB',
  role: Role.MEMBER
};

const davidOjabo: Prisma.UserCreateInput = {
  firstName: 'David',
  lastName: 'Ojabo',
  email: 'Ojabo.D@ravens.com',
  googleAuthId: 'ravensOLB',
  role: Role.MEMBER
};

const markAndrews: Prisma.UserCreateInput = {
  firstName: 'Mark',
  lastName: 'Andrews',
  email: 'Andrews.MD@ravens.com',
  googleAuthId: 'ravensTE',
  role: Role.MEMBER
};

const odellBeckham: Prisma.UserCreateInput = {
  firstName: 'Odell',
  lastName: 'Beckham',
  email: 'Beckham.O@ravens.com',
  googleAuthId: 'ravensWR',
  role: Role.MEMBER
};

const chrisHorton: Prisma.UserCreateInput = {
  firstName: 'Chris',
  lastName: 'Horton',
  email: 'Horton.C@ravens.com',
  googleAuthId: 'ravensSTC',
  role: Role.LEADERSHIP
};

const mikeMacdonald: Prisma.UserCreateInput = {
  firstName: 'Mike',
  lastName: 'Macdonald',
  email: 'Macdonald.M@ravens.com',
  googleAuthId: 'ravensDC',
  role: Role.MEMBER
};

const toddMonken: Prisma.UserCreateInput = {
  firstName: 'Todd',
  lastName: 'Monken',
  email: 'Monken.T@ravens.com',
  googleAuthId: 'ravensOC',
  role: Role.MEMBER
};

const stephenBisciotti: Prisma.UserCreateInput = {
  firstName: 'Stephen',
  lastName: 'Bisciotti',
  email: 'Bisciotti.S@ravens.com',
  googleAuthId: 'ravensOwner',
  role: Role.HEAD
};

const anthonyBernardi: Prisma.UserCreateInput = {
  firstName: 'Anthony',
  lastName: 'Bernadi',
  email: 'bernardi.twan@leavingus.com',
  googleAuthId: 'wagyu',
  role: Role.HEAD
};

const reidChandler: Prisma.UserCreateInput = {
  firstName: 'Reid',
  lastName: 'Chandler',
  email: 'rchandler@frontend.com',
  googleAuthId: 'flank',
  role: Role.HEAD
};

const aang: Prisma.UserCreateInput = {
  firstName: 'Aang',
  lastName: 'Airbender',
  googleAuthId: 'aang',
  email: 'aang@avatarBenders.com',
  role: Role.HEAD
};

const katara: Prisma.UserCreateInput = {
  firstName: 'Katara',
  lastName: 'Waterbender',
  googleAuthId: 'katara',
  email: 'katara@avatarBenders.com',
  role: Role.GUEST
};

const sokka: Prisma.UserCreateInput = {
  firstName: 'Sokka',
  lastName: 'Warrior',
  googleAuthId: 'sokka',
  email: 'sokka@avatarBenders.com',
  role: Role.GUEST
};

const toph: Prisma.UserCreateInput = {
  firstName: 'Toph',
  lastName: 'Beifong',
  googleAuthId: 'toph',
  email: 'toph@avatarBenders.com',
  role: Role.GUEST
};

const zuko: Prisma.UserCreateInput = {
  firstName: 'Zuko',
  lastName: 'Firebender',
  googleAuthId: 'zuko',
  email: 'zuko@avatarBenders.com',
  role: Role.GUEST
};

const iroh: Prisma.UserCreateInput = {
  firstName: 'Uncle',
  lastName: 'Iroh',
  googleAuthId: 'iroh',
  email: 'uncleIroh@avatarBenders.com',
  role: Role.GUEST
};

const azula: Prisma.UserCreateInput = {
  firstName: 'Azula',
  lastName: 'Firebender',
  googleAuthId: 'azula',
  email: 'azula@avatarBenders.com',
  role: Role.GUEST
};

const appa: Prisma.UserCreateInput = {
  firstName: 'Appa',
  lastName: 'Skybison',
  googleAuthId: 'appa',
  email: 'appa@avatarBenders.com',
  role: Role.GUEST
};

const momo: Prisma.UserCreateInput = {
  firstName: 'Momo',
  lastName: 'Monkey',
  googleAuthId: 'momo',
  email: 'momo@avatarBenders.com',
  role: Role.GUEST
};

const suki: Prisma.UserCreateInput = {
  firstName: 'Suki',
  lastName: '-',
  googleAuthId: 'suki',
  email: 'suki@avatarBenders.com',
  role: Role.GUEST
};

const yue: Prisma.UserCreateInput = {
  firstName: 'Princess',
  lastName: 'Yue',
  googleAuthId: 'yue',
  email: 'princessYue@avatarBenders.com',
  role: Role.GUEST
};

const bumi: Prisma.UserCreateInput = {
  firstName: 'King',
  lastName: 'Bumi',
  googleAuthId: 'bumi',
  email: 'kingBumi@avatarBenders.com',
  role: Role.GUEST
};

const cristianoRonaldo: Prisma.UserCreateInput = {
  firstName: 'Cristiano',
  lastName: 'Ronaldo',
  email: 'cronaldo@united.com',
  googleAuthId: 'Winger',
  role: Role.HEAD
};

const thierryHenry: Prisma.UserCreateInput = {
  firstName: 'Thierry',
  lastName: 'Henry',
  email: 'thenry@arsenal.com',
  googleAuthId: 'InvincibleStriker',
  role: Role.MEMBER
};

const frankLampard: Prisma.UserCreateInput = {
  firstName: 'Frank',
  lastName: 'Lampard',
  email: 'flampard@chelsea.com',
  googleAuthId: 'MidfieldMaestro',
  role: Role.MEMBER
};

const stevenGerrard: Prisma.UserCreateInput = {
  firstName: 'Steven',
  lastName: 'Gerrard',
  email: 'sgerrard@liverpool.com',
  googleAuthId: 'RedCaptain',
  role: Role.MEMBER
};

const ryanGiggs: Prisma.UserCreateInput = {
  firstName: 'Ryan',
  lastName: 'Giggs',
  email: 'rgiggs@united.com',
  googleAuthId: 'WingWizard',
  role: Role.MEMBER
};

const alanShearer: Prisma.UserCreateInput = {
  firstName: 'Alan',
  lastName: 'Shearer',
  email: 'ashearer@blackburn.com',
  googleAuthId: 'GoalMachine',
  role: Role.MEMBER
};

const paulScholes: Prisma.UserCreateInput = {
  firstName: 'Paul',
  lastName: 'Scholes',
  email: 'pscholes@united.com',
  googleAuthId: 'PassMaster',
  role: Role.MEMBER
};

const ericCantona: Prisma.UserCreateInput = {
  firstName: 'Eric',
  lastName: 'Cantona',
  email: 'ecantona@united.com',
  googleAuthId: 'KingEric',
  role: Role.MEMBER
};

const didierDrogba: Prisma.UserCreateInput = {
  firstName: 'Didier',
  lastName: 'Drogba',
  email: 'ddrogba@chelsea.com',
  googleAuthId: 'ClutchStriker',
  role: Role.MEMBER
};

const patrickVieira: Prisma.UserCreateInput = {
  firstName: 'Patrick',
  lastName: 'Vieira',
  email: 'pvieira@arsenal.com',
  googleAuthId: 'MidfieldAnchor',
  role: Role.MEMBER
};

const johnTerry: Prisma.UserCreateInput = {
  firstName: 'John',
  lastName: 'Terry',
  email: 'jterry@chelsea.com',
  googleAuthId: 'DefensiveRock',
  role: Role.MEMBER
};

const dennisBergkamp: Prisma.UserCreateInput = {
  firstName: 'Dennis',
  lastName: 'Bergkamp',
  email: 'dbergkamp@arsenal.com',
  googleAuthId: 'DutchMaster',
  role: Role.MEMBER
};

const brooksRobinson: Prisma.UserCreateInput = {
  firstName: 'Brooks',
  lastName: 'Robinson',
  email: 'the.brooksters@orioles.com',
  googleAuthId: 'fries',
  role: Role.HEAD
};

const jimPalmer: Prisma.UserCreateInput = {
  firstName: 'Jim',
  lastName: 'Palmer',
  email: 'jimmy.palms@orioles.com',
  googleAuthId: 'burger',
  role: Role.LEADERSHIP
};

const eddieMurray: Prisma.UserCreateInput = {
  firstName: 'Eddie',
  lastName: 'Murray',
  email: 'eddie.murray@orioles.com',
  googleAuthId: 'hotdog',
  role: Role.HEAD
};

const georgeSisler: Prisma.UserCreateInput = {
  firstName: 'George',
  lastName: 'Sisler',
  email: 'g.sisler@orioles.com',
  googleAuthId: 'popcorn',
  role: Role.LEADERSHIP
};

const urbanShocker: Prisma.UserCreateInput = {
  firstName: 'Urban',
  lastName: 'Shocker',
  email: 'shock.the.game@orioles.com',
  googleAuthId: 'shocking',
  role: Role.MEMBER
};

const kenWilliams: Prisma.UserCreateInput = {
  firstName: 'Ken',
  lastName: 'Williams',
  email: 'justKen@orioles.com',
  googleAuthId: 'kenough',
  role: Role.MEMBER
};

const boogPowell: Prisma.UserCreateInput = {
  firstName: 'Boog',
  lastName: 'Powell',
  email: 'boogs@orioles.com',
  googleAuthId: 'soda',
  role: Role.MEMBER
};

const mannyMachado: Prisma.UserCreateInput = {
  firstName: 'Manny',
  lastName: 'Machado',
  email: 'machoman@orioles.com',
  googleAuthId: 'macho',
  role: Role.HEAD
};

const babyDollJacobson: Prisma.UserCreateInput = {
  firstName: 'Baby Doll',
  lastName: 'Jacobson',
  email: 'bbydoll@orioles.com',
  googleAuthId: 'babes',
  role: Role.LEADERSHIP
};

const frostBite: Prisma.UserCreateInput = {
  firstName: 'Frost',
  lastName: 'Bite',
  googleAuthId: 'husky1',
  email: 'frostbite@northeastern.edu',
  role: Role.MEMBER
};

const winter: Prisma.UserCreateInput = {
  firstName: 'Winter',
  lastName: 'Warrior',
  googleAuthId: 'husky2',
  email: 'winterwarrior@northeastern.edu',
  role: Role.MEMBER
};

const paws: Prisma.UserCreateInput = {
  firstName: 'Paws',
  lastName: 'The-Dog',
  googleAuthId: 'husky3',
  email: 'paws@northeastern.edu',
  role: Role.MEMBER
};

const snowPaws: Prisma.UserCreateInput = {
  firstName: 'Snow',
  lastName: 'Paws',
  googleAuthId: 'husky4',
  email: 'snowpaws@northeastern.edu',
  role: Role.MEMBER
};

const whiteTail: Prisma.UserCreateInput = {
  firstName: 'White',
  lastName: 'Tail',
  googleAuthId: 'husky5',
  email: 'whitetail@northeastern.edu',
  role: Role.MEMBER
};

const husky: Prisma.UserCreateInput = {
  firstName: 'Husky',
  lastName: 'Dog',
  googleAuthId: 'husky6',
  email: 'huskydog@northeastern.edu',
  role: Role.MEMBER
};

const howler: Prisma.UserCreateInput = {
  firstName: 'Howler',
  lastName: 'Husky',
  googleAuthId: 'husky7',
  email: 'howler@northeastern.edu',
  role: Role.MEMBER
};

const snowBite: Prisma.UserCreateInput = {
  firstName: 'Snow',
  lastName: 'Bite',
  googleAuthId: 'husky8',
  email: 'SnowBite@northeastern.edu',
  role: Role.MEMBER
};

// Finance team users

const monopolyman: Prisma.UserCreateInput = {
  firstName: 'Milburn',
  lastName: 'Pennybags',
  email: 'donotpassgo@northeastern.edu',
  role: Role.ADMIN,
  googleAuthId: 'monopoly',
  userSettings: {
    create: {
      defaultTheme: Theme.LIGHT,
      slackId: 'monopolyman'
    }
  }
};

const mrkrabs: Prisma.UserCreateInput = {
  firstName: 'Eugene',
  lastName: 'Krabs',
  email: 'mrkrabs@krustykrabs.com',
  role: Role.ADMIN,
  googleAuthId: 'krabs',
  userSettings: {
    create: {
      defaultTheme: Theme.LIGHT,
      slackId: 'mrkrabs'
    }
  }
};

const richierich: Prisma.UserCreateInput = {
  firstName: 'Richie',
  lastName: 'Rich',
  email: 'richerich@harveycomics.com',
  role: Role.ADMIN,
  googleAuthId: 'rich',
  userSettings: {
    create: {
      defaultTheme: Theme.LIGHT,
      slackId: 'richietherich'
    }
  }
};

export const dbSeedAllUsers = {
  thomasEmrax,
  joeShmoe,
  joeBlow,
  wonderwoman,
  flash,
  aquaman,
  lexLuther,
  hawkgirl,
  elongatedMan,
  zatanna,
  phantomStranger,
  redTornado,
  firestorm,
  hankHeywood,
  robin,
  batman,
  superman,
  hawkMan,
  hawkWoman,
  cyborg,
  greenLantern,
  martianManhunter,
  nightwing,
  aang,
  katara,
  sokka,
  toph,
  zuko,
  iroh,
  azula,
  appa,
  momo,
  suki,
  yue,
  bumi,
  brandonHyde,
  calRipken,
  adleyRutschman,
  johnHarbaugh,
  lamarJackson,
  nezamJazayeri,
  ryanHowe,
  anthonyBernardi,
  reidChandler,
  cristianoRonaldo,
  thierryHenry,
  frankLampard,
  stevenGerrard,
  ryanGiggs,
  paulScholes,
  alanShearer,
  ericCantona,
  patrickVieira,
  didierDrogba,
  johnTerry,
  dennisBergkamp,
  jkDobbins,
  davidOjabo,
  markAndrews,
  odellBeckham,
  chrisHorton,
  mikeMacdonald,
  toddMonken,
  stephenBisciotti,
  brooksRobinson,
  jimPalmer,
  eddieMurray,
  georgeSisler,
  urbanShocker,
  kenWilliams,
  boogPowell,
  mannyMachado,
  babyDollJacobson,
  frostBite,
  winter,
  snowPaws,
  paws,
  whiteTail,
  husky,
  howler,
  snowBite,
  monopolyman,
  mrkrabs,
  richierich
};
