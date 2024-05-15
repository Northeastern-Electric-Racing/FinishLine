/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma, Theme } from '@prisma/client';

const thomasEmrax: Prisma.UserCreateInput = {
  firstName: 'Thomas',
  lastName: 'Emrax',
  googleAuthId: '1',
  email: 'emrax.t@husky.neu.edu',
  emailId: 'emrax.t',
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
  googleAuthId: 'wonderwoman'
};

const lexLuther: Prisma.UserCreateInput = {
  firstName: 'Alexander',
  lastName: 'Luther',
  email: 'lexluther@justiceleague.com',
  googleAuthId: 'hjkklo',
  
};

const hawkgirl: Prisma.UserCreateInput = {
  firstName: 'Shiera',
  lastName: 'Hall',
  email: 'hawkgirl@justiceleague.com',
  googleAuthId: 'bhuujki',
  
};

const elongatedMan: Prisma.UserCreateInput = {
  firstName: 'Randolph',
  lastName: 'Dibney',
  email: 'elongatedmangit @justiceleague.com',
  googleAuthId: 'joigiug',
  
};

const zatanna: Prisma.UserCreateInput = {
  firstName: 'Zatanna',
  lastName: 'Zatara',
  email: 'zatanna@justiceleague.com',
  googleAuthId: 'cawwww',
  
};

const phantomStranger: Prisma.UserCreateInput = {
  firstName: 'Judas',
  lastName: 'Iscariot',
  email: 'phantomstranger@justiceleague.com',
  googleAuthId: 'bnhjiuy',
  
};

const redTornado: Prisma.UserCreateInput = {
  firstName: 'Red',
  lastName: 'Tornado',
  email: 'redtornado@justiceleague.com',
  googleAuthId: 'vbnhught',
  
};

const firestorm: Prisma.UserCreateInput = {
  firstName: 'Ronnie',
  lastName: 'Raymond',
  email: 'firestorm@justiceleague.com',
  googleAuthId: 'fghttyu',
  
};

const hankHeywood: Prisma.UserCreateInput = {
  firstName: 'Hank',
  lastName: 'Heywood III',
  email: 'hankheywood@justiceleague.com',
  googleAuthId: 'hudhsgf',
  
};

const flash: Prisma.UserCreateInput = {
  firstName: 'Barry',
  lastName: 'Allen',
  googleAuthId: 'flaaaash',
  email: 'flash@starlabs.edu',
  emailId: 'barry.allen',
  
};

const aquaman: Prisma.UserCreateInput = {
  firstName: 'Arthur',
  lastName: 'Curry',
  googleAuthId: 'fish',
  email: 'aquaman@gmail.com',
  emailId: 'thefishman',
  
};

const robin: Prisma.UserCreateInput = {
  firstName: 'Damien',
  lastName: 'Wayne',
  googleAuthId: 'robin',
  email: 'robin4@brucewayne.com',
};

const batman: Prisma.UserCreateInput = {
  firstName: 'Bruce',
  lastName: 'Wayne',
  googleAuthId: 'im batman',
  email: 'notbatman@brucewayne.com',
  emailId: 'notbatman',
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
};

const martianManhunter: Prisma.UserCreateInput = {
  firstName: `J'onn`,
  lastName: `J'onnz`,
  email: 'martian.manhunter@justiceleague.com',
  googleAuthId: 'martian',
  
};

const greenLantern: Prisma.UserCreateInput = {
  firstName: 'Hal',
  lastName: 'Jordan',
  email: 'greenlantern1@justiceleague.com',
  googleAuthId: 'green',
  
};

const hawkMan: Prisma.UserCreateInput = {
  firstName: 'Hawk',
  lastName: 'Man',
  email: 'hawkman@justiceleague.com',
  googleAuthId: 'cawwwww',
  
};

const hawkWoman: Prisma.UserCreateInput = {
  firstName: 'Hawk',
  lastName: 'Woman',
  email: 'hawkwoman@justiceleague.com',
  googleAuthId: 'cacawwwww',
  
};

const nightwing: Prisma.UserCreateInput = {
  firstName: 'Dick',
  lastName: 'Grayson',
  email: 'robin1@brucewayne.com',
  googleAuthId: 'robin1',
  
};

const brandonHyde: Prisma.UserCreateInput = {
  firstName: 'Brandon',
  lastName: 'Hyde',
  email: 'brandon.hyde@orioles.com',
  googleAuthId: 'letsgoOs',
  
};

const calRipken: Prisma.UserCreateInput = {
  firstName: 'Cal',
  lastName: 'Ripken',
  email: 'cal.ripken@orioles.com',
  googleAuthId: 'ooooos',
  
};

const adleyRutschman: Prisma.UserCreateInput = {
  firstName: 'Adley',
  lastName: 'Rutschman',
  email: 'adley.rutschman@orioles.com',
  googleAuthId: 'catchin',
  
};

const johnHarbaugh: Prisma.UserCreateInput = {
  firstName: 'John',
  lastName: 'Harbaugh',
  email: 'john.harbaugh@ravens.com',
  googleAuthId: 'hcjh',
};

const lamarJackson: Prisma.UserCreateInput = {
  firstName: 'Lamar',
  lastName: 'Jackson',
  email: 'lamar.jackson@ravens.com',
  googleAuthId: 'lj8',
  
};

const nezamJazayeri: Prisma.UserCreateInput = {
  firstName: 'Nezam',
  lastName: 'Jazayeri',
  email: 'nezam.jazayeri@steakman.com',
  googleAuthId: 'strip',
};

const ryanHowe: Prisma.UserCreateInput = {
  firstName: 'Ryan',
  lastName: 'Howe',
  email: 'howeryan@smoothie.com',
  googleAuthId: 'ribeye',
};

const jkDobbins: Prisma.UserCreateInput = {
  firstName: 'J.K',
  lastName: 'Dobbins',
  email: 'Dobbins.j.k@ravens.com',
  googleAuthId: 'ravensRB',
  
};

const davidOjabo: Prisma.UserCreateInput = {
  firstName: 'David',
  lastName: 'Ojabo',
  email: 'Ojabo.D@ravens.com',
  googleAuthId: 'ravensOLB',
  
};

const markAndrews: Prisma.UserCreateInput = {
  firstName: 'Mark',
  lastName: 'Andrews',
  email: 'Andrews.MD@ravens.com',
  googleAuthId: 'ravensTE',
  
};

const odellBeckham: Prisma.UserCreateInput = {
  firstName: 'Odell',
  lastName: 'Beckham',
  email: 'Beckham.O@ravens.com',
  googleAuthId: 'ravensWR',
  
};

const chrisHorton: Prisma.UserCreateInput = {
  firstName: 'Chris',
  lastName: 'Horton',
  email: 'Horton.C@ravens.com',
  googleAuthId: 'ravensSTC',
  
};

const mikeMacdonald: Prisma.UserCreateInput = {
  firstName: 'Mike',
  lastName: 'Macdonald',
  email: 'Macdonald.M@ravens.com',
  googleAuthId: 'ravensDC',
  
};

const toddMonken: Prisma.UserCreateInput = {
  firstName: 'Todd',
  lastName: 'Monken',
  email: 'Monken.T@ravens.com',
  googleAuthId: 'ravensOC',
  
};

const stephenBisciotti: Prisma.UserCreateInput = {
  firstName: 'Stephen',
  lastName: 'Bisciotti',
  email: 'Bisciotti.S@ravens.com',
  googleAuthId: 'ravensOwner',
};

const anthonyBernardi: Prisma.UserCreateInput = {
  firstName: 'Anthony',
  lastName: 'Bernadi',
  email: 'bernardi.twan@leavingus.com',
  googleAuthId: 'wagyu',
};

const reidChandler: Prisma.UserCreateInput = {
  firstName: 'Reid',
  lastName: 'Chandler',
  email: 'rchandler@frontend.com',
  googleAuthId: 'flank',
};

const aang: Prisma.UserCreateInput = {
  firstName: 'Aang',
  lastName: 'Airbender',
  googleAuthId: 'aang',
  email: 'aang@avatarBenders.com',
};

const katara: Prisma.UserCreateInput = {
  firstName: 'Katara',
  lastName: 'Waterbender',
  googleAuthId: 'katara',
  email: 'katara@avatarBenders.com',
  
};

const sokka: Prisma.UserCreateInput = {
  firstName: 'Sokka',
  lastName: 'Warrior',
  googleAuthId: 'sokka',
  email: 'sokka@avatarBenders.com',
  
};

const toph: Prisma.UserCreateInput = {
  firstName: 'Toph',
  lastName: 'Beifong',
  googleAuthId: 'toph',
  email: 'toph@avatarBenders.com',
  
};

const zuko: Prisma.UserCreateInput = {
  firstName: 'Zuko',
  lastName: 'Firebender',
  googleAuthId: 'zuko',
  email: 'zuko@avatarBenders.com',
  
};

const iroh: Prisma.UserCreateInput = {
  firstName: 'Uncle',
  lastName: 'Iroh',
  googleAuthId: 'iroh',
  email: 'uncleIroh@avatarBenders.com',
  
};

const azula: Prisma.UserCreateInput = {
  firstName: 'Azula',
  lastName: 'Firebender',
  googleAuthId: 'azula',
  email: 'azula@avatarBenders.com',
  
};

const appa: Prisma.UserCreateInput = {
  firstName: 'Appa',
  lastName: 'Skybison',
  googleAuthId: 'appa',
  email: 'appa@avatarBenders.com',
  
};

const momo: Prisma.UserCreateInput = {
  firstName: 'Momo',
  lastName: 'Monkey',
  googleAuthId: 'momo',
  email: 'momo@avatarBenders.com',
  
};

const suki: Prisma.UserCreateInput = {
  firstName: 'Suki',
  lastName: '-',
  googleAuthId: 'suki',
  email: 'suki@avatarBenders.com',
  
};

const yue: Prisma.UserCreateInput = {
  firstName: 'Princess',
  lastName: 'Yue',
  googleAuthId: 'yue',
  email: 'princessYue@avatarBenders.com',
  
};

const bumi: Prisma.UserCreateInput = {
  firstName: 'King',
  lastName: 'Bumi',
  googleAuthId: 'bumi',
  email: 'kingBumi@avatarBenders.com',
  
};

const cristianoRonaldo: Prisma.UserCreateInput = {
  firstName: 'Cristiano',
  lastName: 'Ronaldo',
  email: 'cronaldo@united.com',
  googleAuthId: 'Winger',
};

const thierryHenry: Prisma.UserCreateInput = {
  firstName: 'Thierry',
  lastName: 'Henry',
  email: 'thenry@arsenal.com',
  googleAuthId: 'InvincibleStriker',
  
};

const frankLampard: Prisma.UserCreateInput = {
  firstName: 'Frank',
  lastName: 'Lampard',
  email: 'flampard@chelsea.com',
  googleAuthId: 'MidfieldMaestro',
  
};

const stevenGerrard: Prisma.UserCreateInput = {
  firstName: 'Steven',
  lastName: 'Gerrard',
  email: 'sgerrard@liverpool.com',
  googleAuthId: 'RedCaptain',
  
};

const ryanGiggs: Prisma.UserCreateInput = {
  firstName: 'Ryan',
  lastName: 'Giggs',
  email: 'rgiggs@united.com',
  googleAuthId: 'WingWizard',
  
};

const alanShearer: Prisma.UserCreateInput = {
  firstName: 'Alan',
  lastName: 'Shearer',
  email: 'ashearer@blackburn.com',
  googleAuthId: 'GoalMachine',
  
};

const paulScholes: Prisma.UserCreateInput = {
  firstName: 'Paul',
  lastName: 'Scholes',
  email: 'pscholes@united.com',
  googleAuthId: 'PassMaster',
  
};

const ericCantona: Prisma.UserCreateInput = {
  firstName: 'Eric',
  lastName: 'Cantona',
  email: 'ecantona@united.com',
  googleAuthId: 'KingEric',
  
};

const didierDrogba: Prisma.UserCreateInput = {
  firstName: 'Didier',
  lastName: 'Drogba',
  email: 'ddrogba@chelsea.com',
  googleAuthId: 'ClutchStriker',
  
};

const patrickVieira: Prisma.UserCreateInput = {
  firstName: 'Patrick',
  lastName: 'Vieira',
  email: 'pvieira@arsenal.com',
  googleAuthId: 'MidfieldAnchor',
  
};

const johnTerry: Prisma.UserCreateInput = {
  firstName: 'John',
  lastName: 'Terry',
  email: 'jterry@chelsea.com',
  googleAuthId: 'DefensiveRock',
  
};

const dennisBergkamp: Prisma.UserCreateInput = {
  firstName: 'Dennis',
  lastName: 'Bergkamp',
  email: 'dbergkamp@arsenal.com',
  googleAuthId: 'DutchMaster',
  
};

const brooksRobinson: Prisma.UserCreateInput = {
  firstName: 'Brooks',
  lastName: 'Robinson',
  email: 'the.brooksters@orioles.com',
  googleAuthId: 'fries',
};

const jimPalmer: Prisma.UserCreateInput = {
  firstName: 'Jim',
  lastName: 'Palmer',
  email: 'jimmy.palms@orioles.com',
  googleAuthId: 'burger',
  
};

const eddieMurray: Prisma.UserCreateInput = {
  firstName: 'Eddie',
  lastName: 'Murray',
  email: 'eddie.murray@orioles.com',
  googleAuthId: 'hotdog',
};

const georgeSisler: Prisma.UserCreateInput = {
  firstName: 'George',
  lastName: 'Sisler',
  email: 'g.sisler@orioles.com',
  googleAuthId: 'popcorn',
  
};

const urbanShocker: Prisma.UserCreateInput = {
  firstName: 'Urban',
  lastName: 'Shocker',
  email: 'shock.the.game@orioles.com',
  googleAuthId: 'shocking',
  
};

const kenWilliams: Prisma.UserCreateInput = {
  firstName: 'Ken',
  lastName: 'Williams',
  email: 'justKen@orioles.com',
  googleAuthId: 'kenough',
  
};

const boogPowell: Prisma.UserCreateInput = {
  firstName: 'Boog',
  lastName: 'Powell',
  email: 'boogs@orioles.com',
  googleAuthId: 'soda',
  
};

const mannyMachado: Prisma.UserCreateInput = {
  firstName: 'Manny',
  lastName: 'Machado',
  email: 'machoman@orioles.com',
  googleAuthId: 'macho',
};

const babyDollJacobson: Prisma.UserCreateInput = {
  firstName: 'Baby Doll',
  lastName: 'Jacobson',
  email: 'bbydoll@orioles.com',
  googleAuthId: 'babes',
  
};

const frostBite: Prisma.UserCreateInput = {
  firstName: 'Frost',
  lastName: 'Bite',
  googleAuthId: 'husky1',
  email: 'frostbite@northeastern.edu',
  
};

const winter: Prisma.UserCreateInput = {
  firstName: 'Winter',
  lastName: 'Warrior',
  googleAuthId: 'husky2',
  email: 'winterwarrior@northeastern.edu',
  
};

const paws: Prisma.UserCreateInput = {
  firstName: 'Paws',
  lastName: 'The-Dog',
  googleAuthId: 'husky3',
  email: 'paws@northeastern.edu',
  
};

const snowPaws: Prisma.UserCreateInput = {
  firstName: 'Snow',
  lastName: 'Paws',
  googleAuthId: 'husky4',
  email: 'snowpaws@northeastern.edu',
  
};

const whiteTail: Prisma.UserCreateInput = {
  firstName: 'White',
  lastName: 'Tail',
  googleAuthId: 'husky5',
  email: 'whitetail@northeastern.edu',
  
};

const husky: Prisma.UserCreateInput = {
  firstName: 'Husky',
  lastName: 'Dog',
  googleAuthId: 'husky6',
  email: 'huskydog@northeastern.edu',
  
};

const howler: Prisma.UserCreateInput = {
  firstName: 'Howler',
  lastName: 'Husky',
  googleAuthId: 'husky7',
  email: 'howler@northeastern.edu',
  
};

const snowBite: Prisma.UserCreateInput = {
  firstName: 'Snow',
  lastName: 'Bite',
  googleAuthId: 'husky8',
  email: 'SnowBite@northeastern.edu',
  
};

const zayFlowers: Prisma.UserCreateInput = {
  firstName: 'Zay',
  lastName: 'Flowers',
  googleAuthId: '8172979',
  email: 'flowers.za@ravens.com',
  emailId: 'flowers.za',
  
};

const patrickRicard: Prisma.UserCreateInput = {
  firstName: 'Patrick',
  lastName: 'Ricard',
  googleAuthId: '02894828',
  email: 'ricard.pat@ravens.com',
  emailId: 'ricard.pat',
  
};

const patrickQueen: Prisma.UserCreateInput = {
  firstName: 'Patrick',
  lastName: 'Queen',
  googleAuthId: '8681663',
  email: 'queen.pat@ravens.com',
  emailId: 'queen.pat',
  
};

const jadeveonClowney: Prisma.UserCreateInput = {
  firstName: 'Jadeveon',
  lastName: 'Clowney',
  googleAuthId: '9478927',
  email: 'clowney.jadev@ravens.com',
  emailId: 'clowney.jadev',
  
};

const marlonHumphrey: Prisma.UserCreateInput = {
  firstName: 'Marlon',
  lastName: 'Humphrey',
  googleAuthId: '014629n',
  email: 'humphrey.marl@ravens.com',
  emailId: 'humphrey.marl',
  
};

const kyleHamilton: Prisma.UserCreateInput = {
  firstName: 'Kyle',
  lastName: 'Hamilton',
  googleAuthId: '937299j',
  email: 'hamilton.ky@ravens.com',
  emailId: 'hamilton.ky',
  
};

const marcusWilliams: Prisma.UserCreateInput = {
  firstName: 'Marcus',
  lastName: 'Williams',
  googleAuthId: '018383k',
  email: 'williams.marc@ravens.com',
  emailId: 'williams.marc',
  
};

const roquanSmith: Prisma.UserCreateInput = {
  firstName: 'Roquan',
  lastName: 'Smith',
  googleAuthId: '0193739n',
  email: 'smith.roqu@ravens.com',
  emailId: 'smith.roqu',
  
};

const justinTucker: Prisma.UserCreateInput = {
  firstName: 'Justin',
  lastName: 'Tucker',
  googleAuthId: '018392w',
  email: 'tucker.just@ravens.com',
  emailId: 'tucker.just',
  
};

const monopolyMan: Prisma.UserCreateInput = {
  firstName: 'Milburn',
  lastName: 'Pennybags',
  email: 'donotpassgo@northeastern.edu',
  googleAuthId: 'monopoly',
  userSettings: {
    create: {
      defaultTheme: Theme.LIGHT,
      slackId: 'monopolyman'
    }
  }
};

const mrKrabs: Prisma.UserCreateInput = {
  firstName: 'Eugene',
  lastName: 'Krabs',
  email: 'mrkrabs@krustykrabs.com',
  googleAuthId: 'krabs',
  userSettings: {
    create: {
      defaultTheme: Theme.LIGHT,
      slackId: 'mrkrabs'
    }
  }
};

const richieRich: Prisma.UserCreateInput = {
  firstName: 'Richie',
  lastName: 'Rich',
  email: 'richerich@harveycomics.com',
  googleAuthId: 'rich',
  userSettings: {
    create: {
      defaultTheme: Theme.LIGHT,
      slackId: 'richietherich'
    }
  }
};

const johnBoddy: Prisma.UserCreateInput = {
  firstName: 'John',
  lastName: 'Boddy',
  googleAuthId: 'deadmillionaire',
  email: 'johnboddy@clue.com',
  
};

const villager: Prisma.UserCreateInput = {
  firstName: 'Minecraft',
  lastName: 'Villager',
  googleAuthId: 'villager',
  email: 'hrmmm@minecraft.com',
  
};

const francis: Prisma.UserCreateInput = {
  firstName: 'Francis',
  lastName: 'Francis',
  googleAuthId: 'francis',
  email: 'ffrancis@puppyco.com',
  
};

const victorPerkins: Prisma.UserCreateInput = {
  firstName: 'Victor',
  lastName: 'Perkins',
  googleAuthId: 'victorperkins',
  email: 'mysonstolethemoon@evilbank.com',
  
};

const kingJulian: Prisma.UserCreateInput = {
  firstName: 'King',
  lastName: 'Julian',
  googleAuthId: 'kingjulian',
  email: 'iliketomoveit@jungle.net',
  
};

const regina: Prisma.UserCreateInput = {
  firstName: 'Regina',
  lastName: 'George',
  email: 'regina.g@hotmail.com',
  googleAuthId: 'queenBee',
  userSettings: {
    create: {
      defaultTheme: Theme.DARK,
      slackId: 'Queen Regina'
    }
  }
};

const cady: Prisma.UserCreateInput = {
  firstName: 'Cady',
  lastName: 'Heron',
  email: 'cadyheron@gmail.com',
  googleAuthId: 'cady',
  
};

const janis: Prisma.UserCreateInput = {
  firstName: 'Janis',
  lastName: 'Ian',
  email: 'ian.ja@gmail.com',
  googleAuthId: 'janis',
  
};

const damian: Prisma.UserCreateInput = {
  firstName: 'Damian',
  lastName: '',
  email: 'hotty@hotmail.com',
  googleAuthId: 'damian',
  
};

const gretchen: Prisma.UserCreateInput = {
  firstName: 'Gretchen',
  lastName: 'Wieners',
  googleAuthId: 'gretch',
  email: 'gretchen.weiners@hotmail.com',
  
};

const karen: Prisma.UserCreateInput = {
  firstName: 'Karen',
  lastName: 'Smith',
  googleAuthId: 'karen',
  email: 'smithkaren@hotmail.com',
  
};

const aaron: Prisma.UserCreateInput = {
  firstName: 'Aaron',
  lastName: 'Samuels',
  googleAuthId: 'aaron',
  email: 'samuels.a@gmail.com',
  
};

const glen: Prisma.UserCreateInput = {
  firstName: 'Glen',
  lastName: 'Coco',
  googleAuthId: 'glen',
  email: 'glen@gmail.com',
  
};

const shane: Prisma.UserCreateInput = {
  firstName: 'Shane',
  lastName: 'Oman',
  googleAuthId: 'shane',
  email: 'shane-oman@hotmail.com',
};

const carr: Prisma.UserCreateInput = {
  firstName: 'Coach',
  lastName: 'Carr',
  googleAuthId: 'coach carr',
  email: 'coachcarr@gmail.com',
};

const june: Prisma.UserCreateInput = {
  firstName: 'June',
  lastName: 'George',
  googleAuthId: 'june',
  email: 'plasticsurgery@hotmail.com',
};

const norbury: Prisma.UserCreateInput = {
  firstName: 'Ms',
  lastName: 'Norbury',
  googleAuthId: 'norbury',
  email: 'norbury@netscape.net',
};

const kevin: Prisma.UserCreateInput = {
  firstName: 'Kevin',
  lastName: 'Gnapoor',
  googleAuthId: 'kevin',
  email: 'mathclub@gmail.com',
};

const trang: Prisma.UserCreateInput = {
  firstName: 'Trang',
  lastName: 'Pak',
  googleAuthId: 'trang',
  email: 'trangPAK@hotmail.com',
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

  zayFlowers,
  patrickRicard,
  patrickQueen,
  jadeveonClowney,
  marlonHumphrey,
  kyleHamilton,
  marcusWilliams,
  roquanSmith,
  justinTucker,
  monopolyMan,
  mrKrabs,
  richieRich,
  johnBoddy,
  villager,
  francis,
  victorPerkins,
  kingJulian,
  regina,
  gretchen,
  karen,
  janis,
  aaron,
  cady,
  damian,
  glen,
  shane,
  june,
  kevin,
  norbury,
  carr,
  trang
};
