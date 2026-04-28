/* eslint-disable @typescript-eslint/no-unused-vars */

/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  CR_Type,
  Graph_Display_Type,
  Graph_Type,
  Measure,
  PrismaClient,
  Task_Priority,
  Task_Status,
  Team,
  Part_Tag
} from '@prisma/client';
import { createUser, dbSeedAllUsers } from './seed-data/users.seed.js';
import { dbSeedAllTeams } from './seed-data/teams.seed.js';
import { seedReimbursementRequests } from './seed-data/reimbursement-requests.seed.js';
import ChangeRequestsService from '../services/change-requests.services.js';
import TeamsService from '../services/teams.services.js';
import {
  DayOfWeek,
  GuestDefinitionType,
  MaterialStatus,
  RoleEnum,
  StandardChangeRequest,
  WbsElementStatus,
  WorkPackageStage
} from 'shared';
import TasksService from '../services/tasks.services.js';
import { seedProject } from './seed-data/projects.seed.js';
import { seedWorkPackage } from './seed-data/work-packages.seed.js';
import ReimbursementRequestService from '../services/reimbursement-requests.services.js';
import ProjectsService from '../services/projects.services.js';
import { Decimal } from 'decimal.js';
import BillOfMaterialsService from '../services/boms.services.js';
import UsersService from '../services/users.services.js';
import { toDateString } from 'shared';
import { writeFileSync, readFileSync } from 'fs';
import WbsElementTemplatesService from '../services/wbs-element-templates.services.js';
import RecruitmentServices from '../services/recruitment.services.js';
import OrganizationsService from '../services/organizations.services.js';
import AnnouncementService from '../services/announcement.services.js';
import OnboardingServices from '../services/onboarding.services.js';
import { dbSeedAllParts, dbSeedAllPartTags } from './seed-data/parts.seed.js';
import FinanceServices from '../services/finance.services.js';
import CalendarService from '../services/calendar.services.js';
import { allChangeRequestsReviewed } from '../utils/change-requests.utils.js';

const prisma = new PrismaClient();

// Compute relative dates for seeding
const getRelativeDate = (daysOffset: number, hoursOffset: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(date.getHours() + hoursOffset);
  return date;
};

const daysAgo = (days: number): Date => getRelativeDate(-days);
const daysFromNow = (days: number): Date => getRelativeDate(days);
const weeksAgo = (weeks: number): Date => daysAgo(weeks * 7);
const weeksFromNow = (weeks: number): Date => daysFromNow(weeks * 7);

export const CreatePartTag = async (organizationId: string, name: string, colorHexCode: string) => {
  return await prisma.part_Tag.create({
    data: {
      name,
      organization: {
        connect: { organizationId }
      },
      colorHexCode,
      dateCreated: new Date()
    }
  });
};

export const CreateCommonMistake = async (
  title: string,
  description: string,
  starred: boolean,
  user: { userId: string },
  organizationId: string
) => {
  return await prisma.part_Review_Common_Mistake.create({
    data: {
      title,
      description,
      starred,
      dateCreated: new Date(),
      organization: {
        connect: { organizationId }
      },
      userCreated: {
        connect: { userId: user.userId }
      }
    }
  });
};

export const CreatePartReviewFAQ = async (
  question: string,
  answer: string,
  organizationId: string,
  user: { userId: string }
) => {
  return await prisma.frequentlyAskedQuestion.create({
    data: {
      question,
      answer,
      partReviewFaqOrg: {
        connect: { organizationId }
      },
      userCreated: {
        connect: { userId: user.userId }
      }
    }
  });
};

const performSeed: () => Promise<void> = async () => {
  const thomasEmrax = await prisma.user.create({
    data: dbSeedAllUsers.thomasEmrax,
    include: { userSettings: true, userSecureSettings: true, roles: true }
  });

  const ner = await prisma.organization.create({
    data: {
      name: 'Northeastern Electric Racing',
      userCreatedId: thomasEmrax.userId,
      description:
        'Northeastern Electric Racing is a student-run organization at Northeastern University building all-electric formula-style race cars from scratch to compete in Forumla Hybrid + Electric Formula SAE (FSAE).',
      applicationLink:
        'https://docs.google.com/forms/d/e/1FAIpQLSeCvG7GqmZm_gmSZiahbVTW9ZFpEWG0YfGQbkSB_whhHzxXpA/closedform',
      platformDescription:
        'Finishline is a Project Management Dashboard developed by the Software Team at Northeastern Electric Racing.',
      platformLogoImageId: '1auQO3GYydZOo1-vCn0D2iyCfaxaVFssx'
    }
  });

  const { organizationId } = ner;

  await prisma.user.update({
    where: { userId: thomasEmrax.userId },
    data: {
      organizations: {
        connect: {
          organizationId
        }
      },
      roles: {
        create: {
          roleType: 'APP_ADMIN',
          organizationId
        }
      }
    }
  });

  const joeShmoe = await createUser(dbSeedAllUsers.joeShmoe, RoleEnum.ADMIN, organizationId);
  const joeBlow = await createUser(dbSeedAllUsers.joeBlow, RoleEnum.ADMIN, organizationId);
  const lexLuther = await createUser(dbSeedAllUsers.lexLuther, RoleEnum.HEAD, organizationId);
  const hawkgirl = await createUser(dbSeedAllUsers.hawkgirl, RoleEnum.LEADERSHIP, organizationId);
  const elongatedMan = await createUser(dbSeedAllUsers.elongatedMan, RoleEnum.LEADERSHIP, organizationId);
  const zatanna = await createUser(dbSeedAllUsers.zatanna, RoleEnum.LEADERSHIP, organizationId);
  const phantomStranger = await createUser(dbSeedAllUsers.phantomStranger, RoleEnum.LEADERSHIP, organizationId);
  const redTornado = await createUser(dbSeedAllUsers.redTornado, RoleEnum.LEADERSHIP, organizationId);
  const firestorm = await createUser(dbSeedAllUsers.firestorm, RoleEnum.LEADERSHIP, organizationId);
  const hankHeywood = await createUser(dbSeedAllUsers.hankHeywood, RoleEnum.LEADERSHIP, organizationId);
  const wonderwoman = await createUser(dbSeedAllUsers.wonderwoman, RoleEnum.LEADERSHIP, organizationId);
  const flash = await createUser(dbSeedAllUsers.flash, RoleEnum.LEADERSHIP, organizationId);
  const aquaman = await createUser(dbSeedAllUsers.aquaman, RoleEnum.LEADERSHIP, organizationId);
  await createUser(dbSeedAllUsers.robin, RoleEnum.LEADERSHIP, organizationId);
  const batman = await createUser(dbSeedAllUsers.batman, RoleEnum.APP_ADMIN, organizationId);
  const superman = await createUser(dbSeedAllUsers.superman, RoleEnum.LEADERSHIP, organizationId);
  const hawkMan = await createUser(dbSeedAllUsers.hawkMan, RoleEnum.LEADERSHIP, organizationId);
  const hawkWoman = await createUser(dbSeedAllUsers.hawkWoman, RoleEnum.LEADERSHIP, organizationId);
  const cyborg = await createUser(dbSeedAllUsers.cyborg, RoleEnum.LEADERSHIP, organizationId);
  const greenLantern = await createUser(dbSeedAllUsers.greenLantern, RoleEnum.LEADERSHIP, organizationId);
  const martianManhunter = await createUser(dbSeedAllUsers.martianManhunter, RoleEnum.LEADERSHIP, organizationId);
  const nightwing = await createUser(dbSeedAllUsers.nightwing, RoleEnum.LEADERSHIP, organizationId);
  const brandonHyde = await createUser(dbSeedAllUsers.brandonHyde, RoleEnum.LEADERSHIP, organizationId);
  const calRipken = await createUser(dbSeedAllUsers.calRipken, RoleEnum.LEADERSHIP, organizationId);
  const adleyRutschman = await createUser(dbSeedAllUsers.adleyRutschman, RoleEnum.LEADERSHIP, organizationId);
  const johnHarbaugh = await createUser(dbSeedAllUsers.johnHarbaugh, RoleEnum.LEADERSHIP, organizationId);
  const lamarJackson = await createUser(dbSeedAllUsers.lamarJackson, RoleEnum.LEADERSHIP, organizationId);
  const nezamJazayeri = await createUser(dbSeedAllUsers.nezamJazayeri, RoleEnum.LEADERSHIP, organizationId);
  const ryanHowe = await createUser(dbSeedAllUsers.ryanHowe, RoleEnum.LEADERSHIP, organizationId);
  const anthonyBernardi = await createUser(dbSeedAllUsers.anthonyBernardi, RoleEnum.LEADERSHIP, organizationId);
  const reidChandler = await createUser(dbSeedAllUsers.reidChandler, RoleEnum.LEADERSHIP, organizationId);
  const aang = await createUser(dbSeedAllUsers.aang, RoleEnum.LEADERSHIP, organizationId);
  const katara = await createUser(dbSeedAllUsers.katara, RoleEnum.LEADERSHIP, organizationId);
  const sokka = await createUser(dbSeedAllUsers.sokka, RoleEnum.LEADERSHIP, organizationId);
  const toph = await createUser(dbSeedAllUsers.toph, RoleEnum.LEADERSHIP, organizationId);
  const zuko = await createUser(dbSeedAllUsers.zuko, RoleEnum.LEADERSHIP, organizationId);
  const iroh = await createUser(dbSeedAllUsers.iroh, RoleEnum.LEADERSHIP, organizationId);
  const azula = await createUser(dbSeedAllUsers.azula, RoleEnum.LEADERSHIP, organizationId);
  const appa = await createUser(dbSeedAllUsers.appa, RoleEnum.LEADERSHIP, organizationId);
  const momo = await createUser(dbSeedAllUsers.momo, RoleEnum.LEADERSHIP, organizationId);
  const suki = await createUser(dbSeedAllUsers.suki, RoleEnum.LEADERSHIP, organizationId);
  const yue = await createUser(dbSeedAllUsers.yue, RoleEnum.LEADERSHIP, organizationId);
  const bumi = await createUser(dbSeedAllUsers.bumi, RoleEnum.LEADERSHIP, organizationId);
  const cristianoRonaldo = await createUser(dbSeedAllUsers.cristianoRonaldo, RoleEnum.LEADERSHIP, organizationId);
  const thierryHenry = await createUser(dbSeedAllUsers.thierryHenry, RoleEnum.LEADERSHIP, organizationId);
  const frankLampard = await createUser(dbSeedAllUsers.frankLampard, RoleEnum.LEADERSHIP, organizationId);
  const stevenGerrard = await createUser(dbSeedAllUsers.stevenGerrard, RoleEnum.LEADERSHIP, organizationId);
  const ryanGiggs = await createUser(dbSeedAllUsers.ryanGiggs, RoleEnum.LEADERSHIP, organizationId);
  const paulScholes = await createUser(dbSeedAllUsers.paulScholes, RoleEnum.LEADERSHIP, organizationId);
  const alanShearer = await createUser(dbSeedAllUsers.alanShearer, RoleEnum.LEADERSHIP, organizationId);
  const ericCantona = await createUser(dbSeedAllUsers.ericCantona, RoleEnum.LEADERSHIP, organizationId);
  const patrickVieira = await createUser(dbSeedAllUsers.patrickVieira, RoleEnum.LEADERSHIP, organizationId);
  const didierDrogba = await createUser(dbSeedAllUsers.didierDrogba, RoleEnum.LEADERSHIP, organizationId);
  const johnTerry = await createUser(dbSeedAllUsers.johnTerry, RoleEnum.LEADERSHIP, organizationId);
  const dennisBergkamp = await createUser(dbSeedAllUsers.dennisBergkamp, RoleEnum.LEADERSHIP, organizationId);
  const jkDobbins = await createUser(dbSeedAllUsers.jkDobbins, RoleEnum.LEADERSHIP, organizationId);
  const davidOjabo = await createUser(dbSeedAllUsers.davidOjabo, RoleEnum.LEADERSHIP, organizationId);
  const markAndrews = await createUser(dbSeedAllUsers.markAndrews, RoleEnum.LEADERSHIP, organizationId);
  const odellBeckham = await createUser(dbSeedAllUsers.odellBeckham, RoleEnum.LEADERSHIP, organizationId);
  const chrisHorton = await createUser(dbSeedAllUsers.chrisHorton, RoleEnum.LEADERSHIP, organizationId);
  const mikeMacdonald = await createUser(dbSeedAllUsers.mikeMacdonald, RoleEnum.LEADERSHIP, organizationId);
  const toddMonken = await createUser(dbSeedAllUsers.toddMonken, RoleEnum.LEADERSHIP, organizationId);
  const stephenBisciotti = await createUser(dbSeedAllUsers.stephenBisciotti, RoleEnum.LEADERSHIP, organizationId);
  const brooksRobinson = await createUser(dbSeedAllUsers.brooksRobinson, RoleEnum.LEADERSHIP, organizationId);
  const jimPalmer = await createUser(dbSeedAllUsers.jimPalmer, RoleEnum.LEADERSHIP, organizationId);
  const eddieMurray = await createUser(dbSeedAllUsers.eddieMurray, RoleEnum.LEADERSHIP, organizationId);
  const georgeSisler = await createUser(dbSeedAllUsers.georgeSisler, RoleEnum.LEADERSHIP, organizationId);
  const urbanShocker = await createUser(dbSeedAllUsers.urbanShocker, RoleEnum.LEADERSHIP, organizationId);
  const kenWilliams = await createUser(dbSeedAllUsers.kenWilliams, RoleEnum.LEADERSHIP, organizationId);
  const boogPowell = await createUser(dbSeedAllUsers.boogPowell, RoleEnum.LEADERSHIP, organizationId);
  const mannyMachado = await createUser(dbSeedAllUsers.mannyMachado, RoleEnum.LEADERSHIP, organizationId);
  const babyDollJacobson = await createUser(dbSeedAllUsers.babyDollJacobson, RoleEnum.LEADERSHIP, organizationId);
  const husky = await createUser(dbSeedAllUsers.husky, RoleEnum.LEADERSHIP, organizationId);
  await createUser(dbSeedAllUsers.winter, RoleEnum.LEADERSHIP, organizationId);
  const frostBite = await createUser(dbSeedAllUsers.frostBite, RoleEnum.LEADERSHIP, organizationId);
  const snowPaws = await createUser(dbSeedAllUsers.snowPaws, RoleEnum.LEADERSHIP, organizationId);
  const paws = await createUser(dbSeedAllUsers.paws, RoleEnum.LEADERSHIP, organizationId);
  const whiteTail = await createUser(dbSeedAllUsers.whiteTail, RoleEnum.LEADERSHIP, organizationId);
  const snowBite = await createUser(dbSeedAllUsers.snowBite, RoleEnum.LEADERSHIP, organizationId);
  const howler = await createUser(dbSeedAllUsers.howler, RoleEnum.LEADERSHIP, organizationId);
  const zayFlowers = await createUser(dbSeedAllUsers.zayFlowers, RoleEnum.LEADERSHIP, organizationId);
  const patrickRicard = await createUser(dbSeedAllUsers.patrickRicard, RoleEnum.LEADERSHIP, organizationId);
  const patrickQueen = await createUser(dbSeedAllUsers.patrickQueen, RoleEnum.LEADERSHIP, organizationId);
  const jadeveonClowney = await createUser(dbSeedAllUsers.jadeveonClowney, RoleEnum.LEADERSHIP, organizationId);
  const marlonHumphrey = await createUser(dbSeedAllUsers.marlonHumphrey, RoleEnum.LEADERSHIP, organizationId);
  const kyleHamilton = await createUser(dbSeedAllUsers.kyleHamilton, RoleEnum.LEADERSHIP, organizationId);
  const marcusWilliams = await createUser(dbSeedAllUsers.marcusWilliams, RoleEnum.LEADERSHIP, organizationId);
  const roquanSmith = await createUser(dbSeedAllUsers.roquanSmith, RoleEnum.LEADERSHIP, organizationId);
  const justinTucker = await createUser(dbSeedAllUsers.justinTucker, RoleEnum.LEADERSHIP, organizationId);
  const monopolyMan = await createUser(dbSeedAllUsers.monopolyMan, RoleEnum.LEADERSHIP, organizationId);
  const mrKrabs = await createUser(dbSeedAllUsers.mrKrabs, RoleEnum.LEADERSHIP, organizationId);
  const richieRich = await createUser(dbSeedAllUsers.richieRich, RoleEnum.LEADERSHIP, organizationId);
  const johnBoddy = await createUser(dbSeedAllUsers.johnBoddy, RoleEnum.LEADERSHIP, organizationId);
  const villager = await createUser(dbSeedAllUsers.villager, RoleEnum.LEADERSHIP, organizationId);
  const francis = await createUser(dbSeedAllUsers.francis, RoleEnum.LEADERSHIP, organizationId);
  const victorPerkins = await createUser(dbSeedAllUsers.victorPerkins, RoleEnum.LEADERSHIP, organizationId);
  const kingJulian = await createUser(dbSeedAllUsers.kingJulian, RoleEnum.LEADERSHIP, organizationId);
  const skipper = await createUser(dbSeedAllUsers.skipper, RoleEnum.LEADERSHIP, organizationId);
  const kowalski = await createUser(dbSeedAllUsers.kowalski, RoleEnum.LEADERSHIP, organizationId);
  const privat = await createUser(dbSeedAllUsers.privat, RoleEnum.LEADERSHIP, organizationId);
  const rico = await createUser(dbSeedAllUsers.rico, RoleEnum.LEADERSHIP, organizationId);
  const alex = await createUser(dbSeedAllUsers.alex, RoleEnum.LEADERSHIP, organizationId);
  const marty = await createUser(dbSeedAllUsers.marty, RoleEnum.LEADERSHIP, organizationId);
  const gloria = await createUser(dbSeedAllUsers.gloria, RoleEnum.LEADERSHIP, organizationId);
  const melman = await createUser(dbSeedAllUsers.melman, RoleEnum.LEADERSHIP, organizationId);
  const gretchen = await createUser(dbSeedAllUsers.gretchen, RoleEnum.LEADERSHIP, organizationId);
  const karen = await createUser(dbSeedAllUsers.karen, RoleEnum.LEADERSHIP, organizationId);
  const janis = await createUser(dbSeedAllUsers.janis, RoleEnum.LEADERSHIP, organizationId);
  const aaron = await createUser(dbSeedAllUsers.aaron, RoleEnum.LEADERSHIP, organizationId);
  const cady = await createUser(dbSeedAllUsers.cady, RoleEnum.LEADERSHIP, organizationId);
  const damian = await createUser(dbSeedAllUsers.damian, RoleEnum.LEADERSHIP, organizationId);
  const glen = await createUser(dbSeedAllUsers.glen, RoleEnum.LEADERSHIP, organizationId);
  const shane = await createUser(dbSeedAllUsers.shane, RoleEnum.LEADERSHIP, organizationId);
  const june = await createUser(dbSeedAllUsers.june, RoleEnum.LEADERSHIP, organizationId);
  const kevin = await createUser(dbSeedAllUsers.kevin, RoleEnum.MEMBER, organizationId);
  const norbury = await createUser(dbSeedAllUsers.norbury, RoleEnum.MEMBER, organizationId);
  const carr = await createUser(dbSeedAllUsers.carr, RoleEnum.MEMBER, organizationId);
  const trang = await createUser(dbSeedAllUsers.trang, RoleEnum.MEMBER, organizationId);
  const regina = await createUser(dbSeedAllUsers.regina, RoleEnum.MEMBER, organizationId);
  const patrick = await createUser(dbSeedAllUsers.patrick, RoleEnum.MEMBER, organizationId);
  const spongebob = await createUser(dbSeedAllUsers.spongebob, RoleEnum.MEMBER, organizationId);
  const squidward = await createUser(dbSeedAllUsers.squidward, RoleEnum.MEMBER, organizationId);
  const sandy = await createUser(dbSeedAllUsers.sandy, RoleEnum.MEMBER, organizationId);
  const pearl = await createUser(dbSeedAllUsers.pearl, RoleEnum.LEADERSHIP, organizationId);
  const larry = await createUser(dbSeedAllUsers.larry, RoleEnum.LEADERSHIP, organizationId);
  const mrsPuff = await createUser(dbSeedAllUsers.mrsPuff, RoleEnum.LEADERSHIP, organizationId);
  await createUser(dbSeedAllUsers.guestUser, RoleEnum.GUEST, organizationId);

  await UsersService.updateUserRole(cyborg.userId, thomasEmrax, 'APP_ADMIN', ner);

  const fergus = await prisma.car.create({
    data: {
      wbsElement: {
        create: {
          name: 'Fergus',
          carNumber: 0,
          projectNumber: 0,
          workPackageNumber: 0,
          organizationId
        }
      }
    },
    include: {
      wbsElement: true
    }
  });

  await prisma.car.create({
    data: {
      wbsElement: {
        create: {
          name: 'NER-24',
          carNumber: 24,
          projectNumber: 0,
          workPackageNumber: 0,
          organizationId
        }
      }
    },
    include: {
      wbsElement: true
    }
  });

  const car25 = await prisma.car.create({
    data: {
      wbsElement: {
        create: {
          name: 'NER-25',
          carNumber: 25,
          projectNumber: 0,
          workPackageNumber: 0,
          organizationId
        }
      }
    },
    include: {
      wbsElement: true
    }
  });

  const miles = await prisma.car.create({
    data: {
      wbsElement: {
        create: {
          name: 'Miles',
          carNumber: 1,
          projectNumber: 0,
          workPackageNumber: 0,
          organizationId
        }
      }
    },
    include: {
      wbsElement: true
    }
  });

  const changeRequest1: StandardChangeRequest = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    car25.wbsElement.carNumber,
    fergus.wbsElement.projectNumber,
    fergus.wbsElement.workPackageNumber,
    'need this to initialize all the seed data',
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(batman, changeRequest1.crId, true, ner, 'LGTM');

  /** Set the organization ID in the current process environment and update .env */
  process.env.DEV_ORGANIZATION_ID = organizationId;

  // Read existing .env file
  const envContent = readFileSync('.env', 'utf-8');

  const lines = envContent.split('\n');
  const updatedLines = lines.map((line) => {
    if (line.startsWith('DEV_ORGANIZATION_ID=')) {
      return `DEV_ORGANIZATION_ID=${organizationId}`;
    }
    return line;
  });

  if (!updatedLines.some((line) => line.startsWith('DEV_ORGANIZATION_ID='))) {
    updatedLines.push(`DEV_ORGANIZATION_ID=${organizationId}`);
  }

  writeFileSync('.env', updatedLines.join('\n'));

  /**
   * TEAMS
   */
  /** Creating Team Types */
  const mechanical = await TeamsService.createTeamType(
    batman,
    'Mechanical',
    'Construction',
    'This is the mechanical team',
    ner
  );
  const software = await TeamsService.createTeamType(thomasEmrax, 'Software', 'Code', 'This is the software team', ner);
  const electrical = await TeamsService.createTeamType(
    cyborg,
    'Electrical',
    'ElectricBolt',
    'This is the electrical team',
    ner
  );

  /** Creating Teams */
  const justiceLeague: Team = await prisma.team.create(dbSeedAllTeams.justiceLeague(batman.userId, organizationId));
  const avatarBenders: Team = await prisma.team.create(
    dbSeedAllTeams.avatarBenders(aang.userId, software.teamTypeId, organizationId)
  );
  const ravens: Team = await prisma.team.create(dbSeedAllTeams.ravens(johnHarbaugh.userId, organizationId));
  const orioles: Team = await prisma.team.create(dbSeedAllTeams.orioles(brandonHyde.userId, organizationId));
  const huskies: Team = await prisma.team.create(
    dbSeedAllTeams.huskies(thomasEmrax.userId, electrical.teamTypeId, organizationId)
  );
  const plLegends: Team = await prisma.team.create(dbSeedAllTeams.plLegends(cristianoRonaldo.userId, organizationId));
  const financeTeam: Team = await prisma.team.create(dbSeedAllTeams.financeTeam(monopolyMan.userId, organizationId));
  const slackBotTeam: Team = await prisma.team.create(dbSeedAllTeams.meanGirls(regina.userId, organizationId));
  const krustykrabTeam: Team = await prisma.team.create(dbSeedAllTeams.krustyKrabers(mrKrabs.userId, organizationId));
  const penguinTeam: Team = await prisma.team.create(dbSeedAllTeams.penguinsOfMadagascar(skipper.userId, organizationId));
  /** Setting Team Members */
  await TeamsService.setTeamMembers(
    batman,
    justiceLeague.teamId,
    [
      flash,
      aquaman,
      superman,
      hawkMan,
      hawkWoman,
      greenLantern,
      lexLuther,
      hawkgirl,
      elongatedMan,
      zatanna,
      phantomStranger,
      redTornado,
      firestorm,
      hankHeywood
    ].map((user) => user.userId),
    ner
  );
  await TeamsService.setTeamLeads(
    batman,
    justiceLeague.teamId,
    [wonderwoman, cyborg, martianManhunter, skipper, mrKrabs].map((user) => user.userId),
    ner
  );

  await TeamsService.setTeamMembers(
    monopolyMan,
    financeTeam.teamId,
    [johnBoddy, villager, francis, victorPerkins, kingJulian].map((user) => user.userId),
    ner
  );
  await TeamsService.setTeamLeads(
    monopolyMan,
    financeTeam.teamId,
    [mrKrabs, richieRich].map((user) => user.userId),
    ner
  );

  // Set finance delegates for the organization
  await OrganizationsService.setFinanceDelegates(thomasEmrax, organizationId, [
    monopolyMan.userId,
    mrKrabs.userId,
    richieRich.userId,
    johnBoddy.userId
  ]);

  await TeamsService.setTeamMembers(
    aang,
    avatarBenders.teamId,
    [katara, sokka, toph, zuko, iroh, azula, appa, momo, suki, yue, bumi, patrick].map((user) => user.userId),
    ner
  );
  await TeamsService.setTeamMembers(
    johnHarbaugh,
    ravens.teamId,
    [
      lamarJackson,
      nezamJazayeri,
      ryanHowe,
      jkDobbins,
      davidOjabo,
      markAndrews,
      odellBeckham,
      chrisHorton,
      mikeMacdonald,
      toddMonken,
      stephenBisciotti,
      zayFlowers,
      patrickRicard,
      patrickQueen,
      jadeveonClowney,
      marlonHumphrey,
      kyleHamilton,
      marcusWilliams,
      roquanSmith,
      justinTucker,
      regina
    ].map((user) => user.userId),
    ner
  );
  await TeamsService.setTeamMembers(
    brandonHyde,
    orioles.teamId,
    [
      adleyRutschman,
      calRipken,
      anthonyBernardi,
      brooksRobinson,
      jimPalmer,
      eddieMurray,
      georgeSisler,
      urbanShocker,
      kenWilliams,
      boogPowell,
      mannyMachado,
      babyDollJacobson
    ].map((user) => user.userId),
    ner
  );
  await TeamsService.setTeamMembers(
    thomasEmrax,
    huskies.teamId,
    [joeShmoe, joeBlow, reidChandler, nightwing, frostBite, snowPaws, paws, whiteTail, husky, howler, snowBite].map(
      (user) => user.userId
    ),
    ner
  );

  await TeamsService.setTeamMembers(
    cristianoRonaldo,
    plLegends.teamId,
    [
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
      dennisBergkamp
    ].map((user) => user.userId),
    ner
  );

  await TeamsService.setTeamMembers(
    regina,
    slackBotTeam.teamId,
    [thomasEmrax, batman, cyborg].map((user) => user.userId),
    ner
  );
  await TeamsService.setTeamLeads(
    regina,
    slackBotTeam.teamId,
    [gretchen, karen, aaron, glen, shane, june, kevin, norbury, carr, trang].map((user) => user.userId),
    ner
  );
  await TeamsService.setTeamLeads(
    regina,
    slackBotTeam.teamId,
    [janis, cady, damian].map((user) => user.userId),
    ner
  );

  await TeamsService.setTeamLeads(
    regina,
    slackBotTeam.teamId,
    [mrKrabs, spongebob, squidward, sandy].map((user) => user.userId),
    ner
  );

  await TeamsService.setTeamLeads(
    regina,
    slackBotTeam.teamId,
    [skipper, kowalski, privat, rico, kingJulian, alex, marty, gloria, melman].map((user) => user.userId),
    ner
  );

  /** Link Types */
  const confluenceLinkType = await ProjectsService.createLinkType(batman, 'Confluence', 'description', true, ner, false);

  const bomLinkType = await ProjectsService.createLinkType(batman, 'Bill of Materials', 'bar_chart', true, ner, false);

  const mainWebsiteLinkType = await ProjectsService.createLinkType(batman, 'NER Website', 'bar_chart', true, ner, false);

  const instagramWebsiteLinkType = await ProjectsService.createLinkType(
    batman,
    'NER Instagram',
    'bar_chart',
    true,
    ner,
    false
  );

  await ProjectsService.createLinkType(batman, 'Google Drive', 'folder', true, ner, false);

  /**
   * Projects
   */

  /** TEAM HUSKIES */
  /** Huskies Project 1 */
  const {
    projectWbsNumber: projectHuskies1WbsNumber,
    projectId: projectHuskies1Id,
    leadId: projectHuskies1LeadId,
    managerId: projectHuskies1ManagerId
  } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    car25.wbsElement.carNumber,
    'Impact Attenuator',
    'Develop rules-compliant impact attenuator',
    [huskies.teamId],
    joeShmoe,
    124,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: confluenceLinkType.name
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: bomLinkType.name
      }
    ],
    [],
    thomasEmrax.userId,
    joeBlow.userId,
    ner
  );

  /** Huskies Project 2 */
  const { projectWbsNumber: projectHuskies2WbsNumber, projectId: projectHuskies2Id } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    car25.wbsElement.carNumber,
    'Bodywork',
    'Develop rules-compliant bodywork',
    [huskies.teamId],
    thomasEmrax,
    50,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: confluenceLinkType.name
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: bomLinkType.name
      }
    ],
    [],
    joeShmoe.userId,
    thomasEmrax.userId,
    ner
  );

  /** Huskies Project 3 */
  const { projectWbsNumber: projectHuskies3WbsNumber, projectId: projectHuskies3Id } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    car25.wbsElement.carNumber,
    'Battery Box',
    'Develop rules-compliant battery box.',
    [huskies.teamId],
    thomasEmrax,
    5000,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: confluenceLinkType.name
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: bomLinkType.name
      }
    ],
    [],
    joeShmoe.userId,
    thomasEmrax.userId,
    ner
  );

  /** Huskies Project 4 */
  const { projectWbsNumber: projectHuskies4WbsNumber, projectId: projectHuskies4Id } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    car25.wbsElement.carNumber,
    'Motor Controller Integration',
    'Develop rules-compliant motor controller integration.',
    [huskies.teamId],
    thomasEmrax,
    0,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: confluenceLinkType.name
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: bomLinkType.name
      }
    ],
    [],
    joeShmoe.userId,
    joeBlow.userId,
    ner
  );

  /** SLACKBOT TEAM */
  /** Slackbot Project 1 */
  const {
    projectWbsNumber: projectSlackbot1WbsNumber,
    leadId: Slackbot1LeadId,
    managerId: Slackbot1ManagerId
  } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    car25.wbsElement.carNumber,
    'Wiring Harness',
    'Develop rules-compliant wiring harness.',
    [slackBotTeam.teamId],
    thomasEmrax,
    234,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: confluenceLinkType.name
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: bomLinkType.name
      }
    ],
    [],
    regina.userId,
    janis.userId,
    ner
  );

  /** Slackbot Project 3 */
  const { projectWbsNumber: projectSlackbot2WbsNumber, leadId: Slackbot2LeadId } = await seedProject(
    glen,
    changeRequest1.crId,
    0,
    'Community Outreach Program',
    'Initiate a community outreach program to engage with local schools',
    [slackBotTeam.teamId],
    june,
    5000,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Confluence'
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Bill of Materials'
      }
    ],
    [],
    cady.userId,
    regina.userId,
    ner
  );

  /** Slackbot Project 2 */
  const { projectWbsNumber: projectSlackbot3WbsNumber, leadId: Slackbot3LeadId } = await seedProject(
    glen,
    changeRequest1.crId,
    0,
    'Community Outreach Program',
    'Initiate a community outreach program to engage with local schools',
    [slackBotTeam.teamId],
    janis,
    5000,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Confluence'
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Bill of Materials'
      }
    ],
    [],
    june.userId,
    glen.userId,
    ner
  );

  /** AVATAR TEAM */
  /** Project 6 */
  const { projectWbsNumber: projectAvatar1WbsNumber, projectId: projectAvatar1Id } = await seedProject(
    aang,
    changeRequest1.crId,
    car25.wbsElement.carNumber,
    'Appa Plush',
    'Manufacture plushes of Appa for moral support.',
    [avatarBenders.teamId],
    aang,
    99999,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: confluenceLinkType.name
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: bomLinkType.name
      }
    ],
    [],
    aang.userId,
    katara.userId,
    ner
  );

  /** JUSTICE TEAM */
  /** Justice Project 1 */
  const { projectWbsNumber: projectJustice1WbsNumber, projectId: projectJustice1Id } = await seedProject(
    lexLuther,
    changeRequest1.crId,
    car25.wbsElement.carNumber,
    'Laser Cannon Prototype',
    'Develop a prototype of a laser cannon for the Justice League',
    [justiceLeague.teamId],
    zatanna,
    500,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Confluence'
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Bill of Materials'
      }
    ],
    [],
    zatanna.userId,
    lexLuther.userId,
    ner
  );

  /** Justice Project 2 */
  const { projectWbsNumber: projectJustice2WbsNumber, projectId: projectJustice2Id } = await seedProject(
    superman,
    changeRequest1.crId,
    0,
    'Create the invisible jet.',
    'Develop a prototype of the invisible jet that wonder woman uses.',
    [justiceLeague.teamId],
    wonderwoman,
    500,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Confluence'
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Bill of Materials'
      }
    ],
    [],
    batman.userId,
    hawkMan.userId,
    ner
  );

  /** RAVENS TEAM */
  /** Ravens Project 1 */
  const { projectWbsNumber: projectRavens1WbsNumber } = await seedProject(
    ryanGiggs,
    changeRequest1.crId,
    car25.wbsElement.carNumber,
    'Stadium Renovation',
    `Renovate the team's stadium to improve fan experience`,
    [ravens.teamId],
    mikeMacdonald,
    1000000,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Confluence'
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Bill of Materials'
      }
    ],
    [],
    mikeMacdonald.userId,
    ryanGiggs.userId,
    ner
  );

  /** Krusty Crab Team's Projects*/
  /** Project 1 */
  const { projectWbsNumber: projectKrusty1WbsNumber } = await seedProject(
    mrKrabs,
    changeRequest1.crId,
    fergus.wbsElement.carNumber,
    'Krusty Crab 2 Construction',
    'Need resources to construct a new Krusty Crab location.',
    [krustykrabTeam.teamId],
    squidward,
    1,
    [
      {
        linkId: '1234567890',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Confluence'
      },
      {
        linkId: '-1234567890',
        url: 'https://www.youtube.com/',
        linkTypeName: 'Bill of Materials'
      }
    ],
    [
      /*{
        description: 'Need enough resources to do project.'
      },
      {
        description: 'Need to do so with the least amount of money spent.'
      }*/
    ],
    squidward.userId,
    spongebob.userId,
    ner
  );

  /** Project 2 */

  const { projectWbsNumber: projectKrusty2WbsNumber } = await seedProject(
    mrKrabs,
    changeRequest1.crId,
    fergus.wbsElement.carNumber,
    'Secret Formula Security Tools',
    'Need to buy and install more tools to guard the secret formula.',
    [krustykrabTeam.teamId],
    sandy,
    10,
    [
      {
        linkId: '-0',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Confluence'
      },
      {
        linkId: '-1267890',
        url: 'https://www.youtube.com/',
        linkTypeName: 'Bill of Materials'
      }
    ],
    [
      /*{
        description: 'Need enough resources to do project.'
      },
      {
        description: 'Need to do so with the least amount of money spent.'
      }*/
    ],
    spongebob.userId,
    squidward.userId,
    ner
  );

  /** Penguins of Madagascar's Projects */
  /** Penguin Project 1*/
  const { projectWbsNumber: projectPenguin1WbsNumber, projectId: projectPenguin1id } = await seedProject(
    skipper,
    changeRequest1.crId,
    0,
    'Like to Move It Move It Party',
    'Get people and resources for a big party.',
    [penguinTeam.teamId],
    rico,
    10000000,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Confluence'
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Bill of Materials'
      }
    ],
    [],
    skipper.userId,
    kowalski.userId,
    ner
  );

  /** Penguin Project 2*/
  const { projectWbsNumber: projectPenguin2WbsNumber, projectId: projectPenguin2Id } = await seedProject(
    skipper,
    changeRequest1.crId,
    0,
    'Penguin Scheme',
    'Prepare to win big in gambling in Monaco.',
    [penguinTeam.teamId],
    marty,
    1000,
    [
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Confluence'
      },
      {
        linkId: '-1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        linkTypeName: 'Bill of Materials'
      }
    ],
    [],
    skipper.userId,
    kowalski.userId,
    ner
  );

  /**
   * Graphs
   */

  const graph1 = await prisma.graph.create({
    data: {
      title: 'graph1',
      graphType: Graph_Type.CHANGE_REQUESTS_BY_DIVISION,
      displayGraphType: Graph_Display_Type.BAR,
      measure: Measure.SUM,
      userCreatedId: thomasEmrax.userId,
      organizationId: ner.organizationId
    }
  });
  const graph2 = await prisma.graph.create({
    data: {
      title: 'graph2',
      graphType: Graph_Type.PROJECT_BUDGET_BY_PROJECT,
      displayGraphType: Graph_Display_Type.PIE,
      measure: Measure.SUM,
      userCreatedId: thomasEmrax.userId,
      organizationId: ner.organizationId
    }
  });

  const graphCollection1 = await prisma.graph_Collection.create({
    data: {
      title: 'Graph Collection 1',
      graphs: {
        connect: [{ id: graph2.id }, { id: graph1.id }]
      },
      userCreatedId: thomasEmrax.userId,
      organizationId: ner.organizationId
    }
  });

  /**
   * Change Requests for Creating Work Packages
   */

  const changeRequestHuskiesProject1 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    projectHuskies1WbsNumber.carNumber,
    projectHuskies1WbsNumber.projectNumber,
    projectHuskies1WbsNumber.workPackageNumber,
    'Initializing seed data',
    ner
  );

  const changeRequestProjectHuskies1Id = changeRequestHuskiesProject1.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectHuskies1Id, true, ner, 'LGTM');

  const changeRequestProjectSlackbot1 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    projectSlackbot1WbsNumber.carNumber,
    projectSlackbot1WbsNumber.projectNumber,
    projectSlackbot1WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectSlackbot1Id = changeRequestProjectSlackbot1.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectSlackbot1Id, true, ner, 'LGTM');

  const changeRequestProjectAvatar1 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    projectAvatar1WbsNumber.carNumber,
    projectAvatar1WbsNumber.projectNumber,
    projectAvatar1WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectAvatar1Id = changeRequestProjectAvatar1.crId;

  const changeRequestProjectJustice1 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    projectJustice1WbsNumber.carNumber,
    projectJustice1WbsNumber.projectNumber,
    projectJustice1WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectJustice1Id = changeRequestProjectJustice1.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectJustice1Id, true, ner, 'LGTM');

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectAvatar1Id, true, ner, 'LGTM');

  const changeRequestProjectJustice2 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    projectJustice2WbsNumber.carNumber,
    projectJustice2WbsNumber.projectNumber,
    projectJustice2WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectJustice2Id = changeRequestProjectJustice2.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectJustice2Id, true, ner, 'LGTM');

  const changeRequestProjectRavens1 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    projectRavens1WbsNumber.carNumber,
    projectRavens1WbsNumber.projectNumber,
    projectRavens1WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectRavens1Id = changeRequestProjectRavens1.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectRavens1Id, true, ner, 'LGTM');

  const changeRequestProjectSlackbot2 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    projectSlackbot2WbsNumber.carNumber,
    projectSlackbot2WbsNumber.projectNumber,
    projectSlackbot2WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectSlackbot2Id = changeRequestProjectSlackbot2.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectSlackbot2Id, true, ner, 'LGTM');

  const changeRequestProjectKrusty1 = await ChangeRequestsService.createStandardChangeRequest(
    squidward,
    projectKrusty1WbsNumber.carNumber,
    projectKrusty1WbsNumber.projectNumber,
    projectKrusty1WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectKrusty1Id = changeRequestProjectKrusty1.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectKrusty1Id, true, ner, 'LGTM');

  // Project 2

  const changeRequestProjectKrusty2 = await ChangeRequestsService.createStandardChangeRequest(
    squidward,
    projectKrusty2WbsNumber.carNumber,
    projectKrusty2WbsNumber.projectNumber,
    projectKrusty2WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectKrusty2Id = changeRequestProjectKrusty2.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectKrusty2Id, true, ner, 'LGTM');

  // Penguins
  // For Project 1
  const changeRequestProjectPenguin1 = await ChangeRequestsService.createStandardChangeRequest(
    skipper,
    projectPenguin1WbsNumber.carNumber,
    projectPenguin1WbsNumber.projectNumber,
    projectPenguin1WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectPenguin1Id = changeRequestProjectPenguin1.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectPenguin1Id, true, ner, 'LGTM');

  // For Project 2

  const changeRequestProjectPenguin2 = await ChangeRequestsService.createStandardChangeRequest(
    skipper,
    projectPenguin2WbsNumber.carNumber,
    projectPenguin2WbsNumber.projectNumber,
    projectPenguin2WbsNumber.workPackageNumber,
    'Initial Change Request',
    ner
  );

  const changeRequestProjectPenguin2Id = changeRequestProjectPenguin2.crId;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequestProjectPenguin2Id, true, ner, 'LGTM');

  /**
   * Work Packages
   */
  /** Work Package Huskies 1 */
  const { workPackageWbsNumber: workPackageHuskies1WbsNumber, workPackage: workPackageHuskies1 } = await seedWorkPackage(
    joeShmoe,
    'Bodywork Concept of Design',
    changeRequestProjectHuskies1Id,
    WorkPackageStage.Design,
    weeksAgo(12).toISOString().split('T')[0],
    6,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Active,
    thomasEmrax.userId,
    thomasEmrax.userId,
    projectHuskies1WbsNumber,
    ner
  );

  const workPackage1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackageHuskies1.wbsNum.carNumber,
    workPackageHuskies1.wbsNum.projectNumber,
    workPackageHuskies1.wbsNum.workPackageNumber,
    thomasEmrax.userId,
    joeShmoe.userId,
    weeksAgo(12),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, workPackage1ActivationCrId, true, ner, 'Looks good to me!');

  // await DescriptionBulletsService.checkDescriptionBullet(thomasEmrax, workPackage1.description[0].descriptionId);

  // await DescriptionBulletsService.checkDescriptionBullet(thomasEmrax, workPackage1.expectedActivities[1].descriptionId);

  // await DescriptionBulletsService.checkDescriptionBullet(thomasEmrax, workPackage1.deliverables[0].descriptionId);

  /** Work Package 2 */
  await seedWorkPackage(
    thomasEmrax,
    'Adhesive Shear Strength Test',
    changeRequestProjectHuskies1Id,
    WorkPackageStage.Research,
    weeksAgo(10).toISOString().split('T')[0],
    5,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Inactive,
    joeShmoe.userId,
    thomasEmrax.userId,
    projectHuskies1WbsNumber,
    ner
  );

  /** Work Package Slackbot 1 */
  const { workPackageWbsNumber: workPackageSlackbot1WbsNumber, workPackage: workPackage3 } = await seedWorkPackage(
    thomasEmrax,
    'Manufacture Wiring Harness',
    changeRequestProjectSlackbot1Id,
    WorkPackageStage.Manufacturing,
    weeksAgo(9).toISOString().split('T')[0],
    4,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Active,
    joeShmoe.userId,
    thomasEmrax.userId,
    projectSlackbot1WbsNumber,
    ner
  );

  const workPackageSlackbot1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackageSlackbot1WbsNumber.carNumber,
    workPackageSlackbot1WbsNumber.projectNumber,
    workPackageSlackbot1WbsNumber.workPackageNumber,
    regina.userId,
    janis.userId,
    weeksAgo(9),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, workPackageSlackbot1ActivationCrId, true, ner, 'LGTM!');

  /** Work Package Slackbot 2 */
  const { workPackageWbsNumber: workPackageSlackbot2WbsNumber, workPackage: workPackage4 } = await seedWorkPackage(
    thomasEmrax,
    'Install Wiring Harness',
    changeRequestProjectSlackbot1Id,
    WorkPackageStage.Install,
    weeksAgo(5).toISOString().split('T')[0],
    6,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Active,
    joeShmoe.userId,
    thomasEmrax.userId,
    projectSlackbot1WbsNumber,
    ner
  );

  const workPackageSlackbot2ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackageSlackbot2WbsNumber.carNumber,
    workPackageSlackbot2WbsNumber.projectNumber,
    workPackageSlackbot2WbsNumber.workPackageNumber,
    joeShmoe.userId,
    thomasEmrax.userId,
    weeksAgo(5),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, workPackageSlackbot2ActivationCrId, true, ner, 'LGTM!');

  /** AVATAR TEAM */
  /** Work Packages for Project 1 */
  /** Work Package 1 */
  const { workPackageWbsNumber: workPackageAvatarProject1WbsNumber, workPackage: workPackageAvatarProject1 } =
    await seedWorkPackage(
      aang,
      'Design Plush',
      changeRequestProjectAvatar1Id,
      WorkPackageStage.Design,
      weeksAgo(16).toISOString().split('T')[0],
      7,
      [],
      [],
      aang,
      WbsElementStatus.Complete,
      katara.userId,
      aang.userId,
      projectAvatar1WbsNumber,
      ner
    );

  const workPackageAvatarProject1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    aang,
    workPackageAvatarProject1WbsNumber.carNumber,
    workPackageAvatarProject1WbsNumber.projectNumber,
    workPackageAvatarProject1WbsNumber.workPackageNumber,
    katara.userId,
    aang.userId,
    weeksAgo(16),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(
    joeShmoe,
    workPackageAvatarProject1ActivationCrId,
    true,
    ner,
    'Very cute LGTM!'
  );

  /** Work Package 2 */
  const { workPackageWbsNumber: workPackageAvatarProject2WbsNumber, workPackage: workPackageAvatarProject2 } =
    await seedWorkPackage(
      aang,
      'Put Plush Together',
      changeRequestProjectAvatar1Id,
      WorkPackageStage.Manufacturing,
      weeksAgo(9).toISOString().split('T')[0],
      5,
      [],
      [],
      aang,
      WbsElementStatus.Active,
      katara.userId,
      aang.userId,
      projectAvatar1WbsNumber,
      ner
    );

  const workPackageAvatarProject2ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    aang,
    workPackageAvatarProject2WbsNumber.carNumber,
    workPackageAvatarProject2WbsNumber.projectNumber,
    workPackageAvatarProject2WbsNumber.workPackageNumber,
    katara.userId,
    aang.userId,
    weeksAgo(9),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, workPackageAvatarProject2ActivationCrId, true, ner, 'LGTM!');

  /** Work Package 3 */
  const { workPackageWbsNumber: workPackageAvatarProject3WbsNumber, workPackage: workPackageAvatarProject3 } =
    await seedWorkPackage(
      aang,
      'Plush Testing',
      changeRequestProjectAvatar1Id,
      WorkPackageStage.Testing,
      weeksAgo(4).toISOString().split('T')[0],
      4,
      [],
      [],
      aang,
      WbsElementStatus.Active,
      katara.userId,
      aang.userId,
      projectAvatar1WbsNumber,
      ner
    );

  const workPackageAvatarProject3ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    aang,
    workPackageAvatarProject3WbsNumber.carNumber,
    workPackageAvatarProject3WbsNumber.projectNumber,
    workPackageAvatarProject3WbsNumber.workPackageNumber,
    katara.userId,
    aang.userId,
    weeksAgo(4),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, workPackageAvatarProject3ActivationCrId, true, ner, 'LFG');

  /** Work Packages for Justice League */
  /** Project 1 */
  /** Work Package 1 */
  const { workPackage: projectJustice1WP1 } = await seedWorkPackage(
    lexLuther,
    'Design Laser Canon',
    changeRequestProjectJustice1Id,
    WorkPackageStage.Design,
    weeksAgo(8).toISOString().split('T')[0],
    5,
    [],
    [],
    zatanna,
    WbsElementStatus.Active,
    zatanna.userId,
    lexLuther.userId,
    projectJustice1WbsNumber,
    ner
  );

  const projectJustice1WP1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    lexLuther,
    projectJustice1WP1.wbsNum.carNumber,
    projectJustice1WP1.wbsNum.projectNumber,
    projectJustice1WP1.wbsNum.workPackageNumber,
    zatanna.userId,
    lexLuther.userId,
    weeksAgo(8),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, projectJustice1WP1ActivationCrId, true, ner, 'Approved!');

  /** Work Package 2 */
  await seedWorkPackage(
    lexLuther,
    'Laser Canon Research',
    changeRequestProjectJustice1Id,
    WorkPackageStage.Research,
    weeksAgo(3).toISOString().split('T')[0],
    6,
    [],
    [],
    zatanna,
    WbsElementStatus.Active,
    zatanna.userId,
    lexLuther.userId,
    projectJustice1WbsNumber,
    ner
  );

  /** Work Package 3 */
  await seedWorkPackage(
    lexLuther,
    'Laser Canon Testing',
    changeRequestProjectJustice1Id,
    WorkPackageStage.Testing,
    weeksFromNow(3).toISOString().split('T')[0],
    4,
    [],
    [],
    zatanna,
    WbsElementStatus.Active,
    zatanna.userId,
    lexLuther.userId,
    projectJustice1WbsNumber,
    ner
  );

  /** Project 1 */
  /** Work Package 1 */
  const { workPackage: projectJustice2WP1 } = await seedWorkPackage(
    superman,
    'Design Invisible Jet',
    changeRequestProjectJustice2Id,
    WorkPackageStage.Design,
    weeksAgo(10).toISOString().split('T')[0],
    15,
    [],
    [],
    wonderwoman,
    WbsElementStatus.Active,
    greenLantern.userId,
    hawkMan.userId,
    projectJustice2WbsNumber,
    ner
  );

  const projectJustice2WP1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    lexLuther,
    projectJustice2WP1.wbsNum.carNumber,
    projectJustice2WP1.wbsNum.projectNumber,
    projectJustice2WP1.wbsNum.workPackageNumber,
    zatanna.userId,
    lexLuther.userId,
    weeksAgo(8),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, projectJustice2WP1ActivationCrId, true, ner, 'Approved!');

  /** Work Package 2 */
  await seedWorkPackage(
    superman,
    'Invisible paint coat job',
    changeRequestProjectJustice2Id,
    WorkPackageStage.Design,
    weeksAgo(8).toISOString().split('T')[0],
    5,
    [],
    [],
    wonderwoman,
    WbsElementStatus.Active,
    greenLantern.userId,
    hawkMan.userId,
    projectJustice2WbsNumber,
    ner
  );

  /** Work Packages for Project 8 */
  /** Work Package 1 */
  const { workPackage: project4WP1 } = await seedWorkPackage(
    ryanGiggs,
    'Stadium Research',
    changeRequestProjectRavens1Id,
    WorkPackageStage.Research,
    weeksAgo(14).toISOString().split('T')[0],
    7,
    [],
    [],
    mikeMacdonald,
    WbsElementStatus.Active,
    mikeMacdonald.userId,
    ryanGiggs.userId,
    projectRavens1WbsNumber,
    ner
  );

  const project4WP1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    ryanGiggs,
    project4WP1.wbsNum.carNumber,
    project4WP1.wbsNum.projectNumber,
    project4WP1.wbsNum.workPackageNumber,
    mikeMacdonald.userId,
    ryanGiggs.userId,
    weeksAgo(14),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, project4WP1ActivationCrId, true, ner, 'Approved!');

  /** Work Package 2 */
  await seedWorkPackage(
    ryanGiggs,
    'Stadium Install',
    changeRequestProjectRavens1Id,
    WorkPackageStage.Install,
    weeksAgo(7).toISOString().split('T')[0],
    6,
    [],
    [],
    mikeMacdonald,
    WbsElementStatus.Active,
    mikeMacdonald.userId,
    ryanGiggs.userId,
    projectRavens1WbsNumber,
    ner
  );

  /** Work Package 3 */
  await seedWorkPackage(
    ryanGiggs,
    'Stadium Testing',
    changeRequestProjectRavens1Id,
    WorkPackageStage.Testing,
    weeksAgo(1).toISOString().split('T')[0],
    5,
    [],
    [],
    mikeMacdonald,
    WbsElementStatus.Active,
    mikeMacdonald.userId,
    ryanGiggs.userId,
    projectRavens1WbsNumber,
    ner
  );

  /** Work Packages for Krusty Crab Project 1 */
  /** Work Package 1 */
  const { workPackage: projectKrusty1WP1 } = await seedWorkPackage(
    mrKrabs,
    'Resource Scavenging',
    changeRequestProjectKrusty1Id,
    WorkPackageStage.Research,
    weeksAgo(6).toISOString().split('T')[0],
    3,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrKrabs.userId,
    squidward.userId,
    projectKrusty1WbsNumber,
    ner
  );

  const projectKrusty1WP1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    mrKrabs,
    projectKrusty1WP1.wbsNum.carNumber,
    projectKrusty1WP1.wbsNum.projectNumber,
    projectKrusty1WP1.wbsNum.workPackageNumber,
    mrKrabs.userId,
    squidward.userId,
    weeksAgo(6),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, projectKrusty1WP1ActivationCrId, true, ner, 'Approved!');

  /** Work Package 2 */
  await seedWorkPackage(
    mrKrabs,
    'Fundraising',
    changeRequestProjectKrusty1Id,
    WorkPackageStage.Install,
    weeksAgo(7).toISOString().split('T')[0],
    6,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    squidward.userId,
    squidward.userId,
    projectKrusty1WbsNumber,
    ner
  );

  /** Work Package 3 */
  await seedWorkPackage(
    sandy,
    'Restaurant Launch',
    changeRequestProjectKrusty1Id,
    WorkPackageStage.Install,
    weeksAgo(13).toISOString().split('T')[0],
    6,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    sandy.userId,
    squidward.userId,
    projectKrusty1WbsNumber,
    ner
  );

  /** Work Packages for Krusty Krab Project 2 */
  /** Work Package 1 */
  const { workPackage: projectKrusty2WP1 } = await seedWorkPackage(
    mrKrabs,
    'Go through every garbage yard to find the materials needed to make tools.',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Research,
    weeksAgo(2).toISOString().split('T')[0],
    10,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrKrabs.userId,
    squidward.userId,
    projectKrusty2WbsNumber,
    ner
  );

  const projectKrusty2WP1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    mrKrabs,
    projectKrusty2WP1.wbsNum.carNumber,
    projectKrusty2WP1.wbsNum.projectNumber,
    projectKrusty2WP1.wbsNum.workPackageNumber,
    mrKrabs.userId,
    squidward.userId,
    weeksAgo(6),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, projectKrusty2WP1ActivationCrId, true, ner, 'Approved!');

  /** Work Package 2 */
  await seedWorkPackage(
    mrKrabs,
    "Distract Plankton so he doesn't know",
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(7).toISOString().split('T')[0],
    6,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    pearl.userId,
    squidward.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 3 */
  await seedWorkPackage(
    mrKrabs,
    'Install the tools',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(1).toISOString().split('T')[0],
    8,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    larry.userId,
    squidward.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 4 */
  await seedWorkPackage(
    mrKrabs,
    "Get Plankton's attention to see how effective these tools are.",
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-2).toISOString().split('T')[0],
    2,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 5 */
  await seedWorkPackage(
    mrKrabs,
    "React to Plankton's incompetency",
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-5).toISOString().split('T')[0],
    1,
    [],
    [],
    mrKrabs,
    WbsElementStatus.Active,
    squidward.userId,
    mrKrabs.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 6 */
  await seedWorkPackage(
    mrKrabs,
    'Contemplate how Planton can be humiliated even more.',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-8).toISOString().split('T')[0],
    5,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 7 */
  await seedWorkPackage(
    mrKrabs,
    'Get even more materials at the junk yard',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-10).toISOString().split('T')[0],
    2,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 8 */
  await seedWorkPackage(
    mrKrabs,
    'Get more effective tools',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-12).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 9 */
  await seedWorkPackage(
    mrKrabs,
    'Laugh at Plankton even more',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-14).toISOString().split('T')[0],
    3,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 10 */
  await seedWorkPackage(
    mrKrabs,
    'Do you think there are too many work packages?',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-15).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 11 */
  await seedWorkPackage(
    mrKrabs,
    'Honestly I do not think there are enough work packages ',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-16).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 12 */
  await seedWorkPackage(
    mrKrabs,
    '#wewantmoreworkpackages ',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-17).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 13 */
  await seedWorkPackage(
    mrKrabs,
    "Besides wouldn't it be interesting if there was something interesting in thes work packages? ",
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-18).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 14 */
  await seedWorkPackage(
    mrKrabs,
    "Mr Krabs loves work packages as he doesn't need to pay Spongebob or Squidward ",
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-18).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 15 */
  await seedWorkPackage(
    mrKrabs,
    'I wonder how many work packages can be put in a single project.',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-22).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 16 */
  await seedWorkPackage(
    mrKrabs,
    "I'm starting to forget what the original goal of the program is tbh.",
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-22).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 17 */
  await seedWorkPackage(
    mrKrabs,
    'Did you know that “Bubblestand” / “Ripped Pants” was aired on July 17th, 1999?' +
      'What a coincidence with work package 17 with the number 17',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-22).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 18 */
  await seedWorkPackage(
    mrKrabs,
    'Season 8 & Season 11 also have Episode 18 entries',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-22).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 19 */
  await seedWorkPackage(
    mrKrabs,
    'Season 1, Episode 19 is “Neptune’s Spatula” / “Hooky.”',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-22).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Package 20 */
  await seedWorkPackage(
    mrKrabs,
    'I think we have enough work packages in a project for right now',
    changeRequestProjectKrusty2Id,
    WorkPackageStage.Install,
    weeksAgo(-22).toISOString().split('T')[0],
    1,
    [],
    [],
    spongebob,
    WbsElementStatus.Active,
    mrsPuff.userId,
    larry.userId,
    projectKrusty2WbsNumber,
    ner
  );

  /** Work Packages for Penguin Project 1*/
  /** Work Package 1 */
  const { workPackage: projectPenguin1WP1 } = await seedWorkPackage(
    kingJulian,
    'Party Music Set Up',
    changeRequestProjectPenguin1Id,
    WorkPackageStage.Install,
    weeksAgo(52).toISOString().split('T')[0],
    365,
    [],
    [],
    skipper,
    WbsElementStatus.Active,
    kowalski.userId,
    rico.userId,
    projectPenguin1WbsNumber,
    ner
  );

  const projectPenguin1WP1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    kingJulian,
    projectPenguin1WP1.wbsNum.carNumber,
    projectPenguin1WP1.wbsNum.projectNumber,
    projectPenguin1WP1.wbsNum.workPackageNumber,
    rico.userId,
    kowalski.userId,
    weeksAgo(6),
    true,
    ner
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, projectPenguin1WP1ActivationCrId, true, ner, 'Approved!');

  /** Work Packages for Penguin Project 2*/
  /** Work Package 1 */
  const { workPackage: projectPenguin2WP1 } = await seedWorkPackage(
    skipper,
    'Make a robot human.',
    changeRequestProjectPenguin2Id,
    WorkPackageStage.Install,
    weeksAgo(2).toISOString().split('T')[0],
    1,
    [],
    [],
    alex,
    WbsElementStatus.Active,
    kowalski.userId,
    rico.userId,
    projectPenguin1WbsNumber,
    ner
  );

  const projectPenguin2WP2ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    kingJulian,
    projectPenguin2WP1.wbsNum.carNumber,
    projectPenguin2WP1.wbsNum.projectNumber,
    projectPenguin2WP1.wbsNum.workPackageNumber,
    rico.userId,
    kowalski.userId,
    weeksAgo(6),
    true,
    ner
  );

  const { workPackage: projectPenguin2WP2 } = await seedWorkPackage(
    skipper,
    'Make the robot learn gambling algorithms.',
    changeRequestProjectPenguin2Id,
    WorkPackageStage.Install,
    weeksAgo(12).toISOString().split('T')[0],
    15,
    [],
    [],
    alex,
    WbsElementStatus.Active,
    kowalski.userId,
    rico.userId,
    projectPenguin1WbsNumber,
    ner
  );

  const { workPackage: projectPenguin2WP3 } = await seedWorkPackage(
    skipper,
    'Make connections in the casino.',
    changeRequestProjectPenguin2Id,
    WorkPackageStage.Install,
    weeksAgo(1).toISOString().split('T')[0],
    150,
    [],
    [],
    melman,
    WbsElementStatus.Active,
    rico.userId,
    gloria.userId,
    projectPenguin1WbsNumber,
    ner
  );

  /**
   * Change Requests
   */
  await ChangeRequestsService.createStageGateChangeRequest(
    thomasEmrax,
    workPackageHuskies1WbsNumber.carNumber,
    workPackageHuskies1WbsNumber.projectNumber,
    workPackageHuskies1WbsNumber.workPackageNumber,
    true,
    ner
  );

  const changeRequest2 = await ChangeRequestsService.createStandardChangeRequest(
    thomasEmrax,
    projectHuskies2WbsNumber.carNumber,
    projectHuskies2WbsNumber.projectNumber,
    projectHuskies2WbsNumber.workPackageNumber,
    'Change the bodywork to be hot pink',
    ner
  );
  await ChangeRequestsService.reviewChangeRequest(joeShmoe, changeRequest2.crId, false, ner, 'What the hell Thomas');

  await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackageSlackbot1WbsNumber.carNumber,
    workPackageSlackbot1WbsNumber.projectNumber,
    workPackageSlackbot1WbsNumber.workPackageNumber,
    thomasEmrax.userId,
    joeShmoe.userId,
    weeksAgo(9),
    true,
    ner
  );

  /**
   * Tasks
   */
  await TasksService.createTask(
    joeShmoe,
    projectHuskies1WbsNumber,
    'Research attenuation',
    "I don't know what attenuation is yet",
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId],
    ner,
    undefined,
    daysFromNow(10)
  );

  await TasksService.createTask(
    joeShmoe,
    projectHuskies1WbsNumber,
    'Design Attenuator',
    'Autocad?',
    Task_Priority.MEDIUM,
    Task_Status.IN_BACKLOG,
    [joeShmoe.userId],
    ner,
    daysAgo(5),
    daysFromNow(15)
  );

  await TasksService.createTask(
    joeBlow,
    projectHuskies1WbsNumber,
    'Research Impact',
    'Autocad?',
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId, joeBlow.userId],
    ner,
    undefined,
    daysFromNow(8)
  );

  await TasksService.createTask(
    joeShmoe,
    projectHuskies1WbsNumber,
    'Impact Test',
    'Use our conveniently available jumbo watermelon and slingshot to test how well our impact attenuator can ' +
      'attenuate impact.',
    Task_Priority.LOW,
    Task_Status.IN_PROGRESS,
    [joeBlow.userId],
    ner,
    undefined,
    daysFromNow(14)
  );

  await TasksService.createTask(
    joeBlow,
    projectHuskies1WbsNumber,
    'Review Compliance',
    'I think there are some rules we may or may not have overlooked...',
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId],
    ner,
    daysAgo(14),
    daysFromNow(7)
  );

  await TasksService.createTask(
    thomasEmrax,
    projectHuskies1WbsNumber,
    'Decorate Impact Attenuator',
    'You know you want to.',
    Task_Priority.LOW,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId, joeBlow.userId, joeShmoe.userId],
    ner,
    undefined,
    daysFromNow(9)
  );

  await TasksService.createTask(
    lamarJackson,
    projectHuskies1WbsNumber,
    'Meet with the Department of Transportation',
    'Discuss design decisions',
    Task_Priority.LOW,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId],
    ner,
    undefined,
    daysFromNow(6)
  );

  await TasksService.createTask(
    joeShmoe,
    projectHuskies1WbsNumber,
    'Build Attenuator',
    'WOOOO',
    Task_Priority.LOW,
    Task_Status.DONE,
    [joeShmoe.userId],
    ner,
    undefined,
    daysAgo(30)
  );

  await TasksService.createTask(
    thomasEmrax,
    projectHuskies1WbsNumber,
    "Drive Northeastern Electric Racing's Hand-Built Car That Tops Out at 100 mph",
    "It was a chilly November night and Matthew McCauley's breath was billowing out in front of him when he took hold " +
      "of the wheel and put pedal to the metal. Accelerating down straightaways and taking corners with finesse, it's " +
      'easy to forget McCauley, in his blue racing jacket and jet black helmet, is racing laps around the roof of ' +
      "Columbus Parking Garage on Northeastern's Boston campus. But that's the reality of Northeastern Electric " +
      'Racing, a student club that has made due and found massive success in the world of electric racing despite its ' +
      "relative rookie status. McCauley, NER's chief electrical engineer, has seen the club's car, Cinnamon, go from " +
      'a 5-foot drive test to hitting 60 miles per hour in competitions. "It\'s a go-kart that has 110 kilowatts of ' +
      'power, 109 kilowatts of power," says McCauley, a fourth-year electrical and computer engineering student. ' +
      '"That\'s over 100 horsepower."',
    Task_Priority.HIGH,
    Task_Status.DONE,
    [joeShmoe.userId],
    ner,
    undefined,
    daysAgo(90)
  );

  await TasksService.createTask(
    brandonHyde,
    projectHuskies1WbsNumber,
    'Safety Training',
    'how to use (or not use) the impact attenuator',
    Task_Priority.HIGH,
    Task_Status.DONE,
    [thomasEmrax.userId, joeBlow.userId, joeShmoe.userId],
    ner,
    daysAgo(70),
    daysAgo(55)
  );

  await TasksService.createTask(
    thomasEmrax,
    projectHuskies2WbsNumber,
    'Double-Check Inventory',
    'Nobody really wants to do this...',
    Task_Priority.LOW,
    Task_Status.IN_BACKLOG,
    [],
    ner,
    undefined,
    daysFromNow(12)
  );

  await TasksService.createTask(
    thomasEmrax,
    projectHuskies2WbsNumber,
    'Aerodynamics Test',
    'Wind go wooooosh',
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId],
    ner,
    undefined,
    daysFromNow(8)
  );

  await TasksService.createTask(
    johnHarbaugh,
    projectHuskies2WbsNumber,
    'Ask Sponsors About Logo Sticker Placement',
    'the more sponsors the cooler we look',
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId, joeShmoe.userId],
    ner,
    undefined,
    daysFromNow(7)
  );

  await TasksService.createTask(
    thomasEmrax,
    projectHuskies2WbsNumber,
    'Discuss Design With Powertrain Team',
    '',
    Task_Priority.MEDIUM,
    Task_Status.DONE,
    [thomasEmrax.userId],
    ner,
    daysAgo(80),
    daysAgo(65)
  );

  await TasksService.createTask(
    batman,
    projectHuskies3WbsNumber,
    'Power the Battery Box',
    'With all our powers combined, we can win any Electric Racing competition!',
    Task_Priority.MEDIUM,
    Task_Status.IN_BACKLOG,
    [thomasEmrax, joeShmoe, joeBlow].map((user) => user.userId),
    ner,
    undefined,
    daysFromNow(16)
  );

  await TasksService.createTask(
    thomasEmrax,
    projectHuskies3WbsNumber,
    'Wire Up Battery Box',
    'Too many wires... how to even keep track?',
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId],
    ner,
    undefined,
    daysFromNow(13)
  );

  await TasksService.createTask(
    thomasEmrax,
    projectHuskies3WbsNumber,
    'Vibration Tests',
    "Battery box shouldn't blow up in the middle of racing...",
    Task_Priority.MEDIUM,
    Task_Status.IN_BACKLOG,
    [joeShmoe.userId],
    ner,
    undefined,
    daysFromNow(18)
  );

  await TasksService.createTask(
    joeShmoe,
    projectHuskies3WbsNumber,
    'Buy some Battery Juice',
    'mmm battery juice',
    Task_Priority.LOW,
    Task_Status.DONE,
    [joeBlow.userId],
    ner,
    undefined,
    daysAgo(45)
  );

  await TasksService.createTask(
    thomasEmrax,
    projectHuskies4WbsNumber,
    'Schematics',
    'schematics go brrrrr',
    Task_Priority.HIGH,
    Task_Status.DONE,
    [joeBlow.userId],
    ner,
    undefined,
    daysAgo(60)
  );

  await TasksService.createTask(
    regina,
    projectSlackbot1WbsNumber,
    'Cost Assessment',
    'So this is where our funding goes',
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [regina.userId],
    ner,
    daysAgo(21),
    daysAgo(10)
  );

  await TasksService.createTask(
    zatanna,
    projectJustice1WbsNumber,
    'Laser Funding',
    'So this is where our funding goes',
    Task_Priority.HIGH,
    Task_Status.DONE,
    [zatanna.userId],
    ner,
    daysAgo(10),
    daysAgo(9)
  );

  await TasksService.createTask(
    sandy,
    projectKrusty1WbsNumber,
    'Opening Assessment',
    'So we discuss Krusky Krab openin here',
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [sandy.userId],
    ner,
    daysAgo(16),
    daysAgo(1)
  );

  /**
   * Reimbursements
   */
  const vendorTesla = await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Tesla',
    ner,
    false,
    [thomasEmrax.userId],
    'Tax exemption status? This is a test i am writing alot of text ahhahahahahhaha this is more of a test i am going to write even more test hahahahah.',
    'nershipping@gmail.com',
    'racecar228!',
    'SAVE50!'
  );
  const vendorAmazon = await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Amazon',
    ner,
    true,
    [thomasEmrax.userId],
    'They want updates on work',
    'amazon@gmail.com',
    'racecare228!',
    'SAVE20!'
  );
  const vendorGoogle = await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Google',
    ner,
    false,
    [thomasEmrax.userId],
    'Tax exemption ID NUMBER',
    'google@gmail.com',
    'racecar228!',
    'SAVE50!'
  );
  const vendorMicrosoft = await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Microsoft',
    ner,
    true,
    [thomasEmrax.userId],
    'Requires monthly invoicing',
    'microsoft@outlook.com',
    'secure123!',
    'WELCOME10'
  );
  const vendorApple = await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Apple',
    ner,
    false,
    [thomasEmrax.userId],
    'Eco-friendly packaging preferred',
    'apple@icloud.com',
    'appl3Secure!',
    'APPLE30'
  );
  const vendorCostco = await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Costco',
    ner,
    false,
    [thomasEmrax.userId],
    'Tax ID attached',
    'costco@wholesale.com',
    'bulkBuy22!',
    'BULKDEAL'
  );
  const vendorWalmart = await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Walmart',
    ner,
    true,
    [thomasEmrax.userId],
    'Requires contact for all returns',
    'support@walmart.com',
    'WalMartP@ss1',
    'ROLLBACK15'
  );
  const vendorTarget = await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Target',
    ner,
    true,
    [thomasEmrax.userId],
    'Needs weekly usage reports',
    'vendors@target.com',
    'target321!',
    'REDTAG10'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'eBay',
    ner,
    false,
    [thomasEmrax.userId],
    'Verification required',
    'support@ebay.com',
    'eBayS3ll3r!',
    'FREESHIP'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Netflix',
    ner,
    false,
    [thomasEmrax.userId],
    'Subscription-based payments',
    'billing@netflix.com',
    'stream4life!',
    'BINGE50'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Spotify',
    ner,
    false,
    [thomasEmrax.userId],
    'Requires invoice numbers on docs',
    'accounts@spotify.com',
    'listen2music!',
    'MUSIC25'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Adobe',
    ner,
    true,
    [thomasEmrax.userId],
    'Needs PO for every purchase',
    'adobe@creative.com',
    'Cr3at1ve!',
    'DESIGN10'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Dell',
    ner,
    true,
    [thomasEmrax.userId],
    'Requesting business license',
    'orders@dell.com',
    'd3llP@ss!',
    'TECH30'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'HP',
    ner,
    false,
    [thomasEmrax.userId],
    'Needs signed agreement on file',
    'support@hp.com',
    'hpSecure12!',
    'PRINT20'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Facebook',
    ner,
    true,
    [thomasEmrax.userId],
    'Wants to be listed as priority',
    'fb@meta.com',
    'm3taPass!',
    'META15'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'LinkedIn',
    ner,
    false,
    [thomasEmrax.userId],
    'Requires biannual contract renewal',
    'contact@linkedin.com',
    'workN3tw0rk!',
    'NETWORK25'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Zoom',
    ner,
    true,
    [thomasEmrax.userId],
    'Asks for contact before upgrades',
    'sales@zoom.us',
    'z00mM33t!',
    'VIDEO5'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Slack',
    ner,
    false,
    [thomasEmrax.userId],
    'Needs project reference ID',
    'help@slack.com',
    'sl@ckwork!',
    'COLLAB10'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Stripe',
    ner,
    false,
    [thomasEmrax.userId],
    'Bank info needed for setup',
    'payments@stripe.com',
    'fintech123!',
    'PAYSAFE'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Square',
    ner,
    true,
    [thomasEmrax.userId],
    'Tax info must be updated yearly',
    'vendor@square.com',
    'squ@reRoot!',
    'CASHAPP'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Notion',
    ner,
    false,
    [thomasEmrax.userId],
    'Requires shared workspace invite',
    'support@notion.so',
    'not3sApp!',
    'PLAN50'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'GitHub',
    ner,
    true,
    [thomasEmrax.userId],
    'Open source licenses required',
    'billing@github.com',
    'ghRepos!',
    'DEV25'
  );
  await ReimbursementRequestService.createVendor(
    thomasEmrax,
    'Trello',
    ner,
    false,
    [thomasEmrax.userId],
    'Needs card for each request',
    'boards@trello.com',
    'tr3ll0Board!',
    'TASK15'
  );

  const indexCodeCash = await ReimbursementRequestService.createIndexCode('CASH', '830667', thomasEmrax, ner);
  const indexCodeBudget = await ReimbursementRequestService.createIndexCode('BUDGET', '800462', thomasEmrax, ner);

  const accountCode = await ReimbursementRequestService.createAccountCode(
    thomasEmrax,
    'Equipment',
    123,
    true,
    [indexCodeCash.indexCodeId, indexCodeBudget.indexCodeId],
    ner,
    1050
  );

  const accountCode2 = await ReimbursementRequestService.createAccountCode(
    thomasEmrax,
    'Things',
    456,
    false,
    [indexCodeBudget.indexCodeId],
    ner,
    2000
  );

  const accountCode3 = await ReimbursementRequestService.createAccountCode(
    thomasEmrax,
    'Stuff',
    789,
    true,
    [indexCodeCash.indexCodeId],
    ner,
    3010
  );

  // Add userSecureSettings for users who will create reimbursement requests
  const usersNeedingSecureSettings = [
    { user: joeShmoe, varName: 'joeShmoe' },
    { user: batman, varName: 'batman' },
    { user: superman, varName: 'superman' },
    { user: flash, varName: 'flash' },
    { user: aquaman, varName: 'aquaman' },
    { user: wonderwoman, varName: 'wonderwoman' },
    { user: greenLantern, varName: 'greenLantern' },
    { user: cyborg, varName: 'cyborg' },
    { user: martianManhunter, varName: 'martianManhunter' },
    { user: nightwing, varName: 'nightwing' },
    { user: aang, varName: 'aang' },
    { user: katara, varName: 'katara' },
    { user: sokka, varName: 'sokka' },
    { user: toph, varName: 'toph' },
    { user: zuko, varName: 'zuko' },
    { user: regina, varName: 'regina' },
    { user: cady, varName: 'cady' },
    { user: gretchen, varName: 'gretchen' },
    { user: karen, varName: 'karen' },
    { user: spongebob, varName: 'spongebob' },
    { user: patrick, varName: 'patrick' },
    { user: squidward, varName: 'squidward' },
    { user: sandy, varName: 'sandy' }
  ];

  const updatedUsers: any = {};

  for (let i = 0; i < usersNeedingSecureSettings.length; i++) {
    const { user, varName } = usersNeedingSecureSettings[i];
    await prisma.user_Secure_Settings.create({
      data: {
        userSecureSettingsId: `secure-${user.userId}`,
        userId: user.userId,
        nuid: `00123456${i.toString().padStart(2, '0')}`,
        phoneNumber: `123456${i.toString().padStart(4, '0')}`,
        street: `${100 + i} Main St`,
        city: 'Boston',
        state: 'MA',
        zipcode: '02115'
      }
    });

    // Re-fetch user with secure settings
    const updatedUser = await prisma.user.findUnique({
      where: { userId: user.userId },
      include: { userSettings: true, userSecureSettings: true, roles: true }
    });
    updatedUsers[varName] = updatedUser;
  }

  // Seed comprehensive reimbursement requests with various statuses and assignees
  const seededReimbursementRequests = await seedReimbursementRequests(
    {
      thomasEmrax,
      joeShmoe: updatedUsers.joeShmoe,
      batman: updatedUsers.batman,
      superman: updatedUsers.superman,
      flash: updatedUsers.flash,
      aquaman: updatedUsers.aquaman,
      wonderwoman: updatedUsers.wonderwoman,
      greenLantern: updatedUsers.greenLantern,
      cyborg: updatedUsers.cyborg,
      martianManhunter: updatedUsers.martianManhunter,
      robin: updatedUsers.nightwing, // Using nightwing as robin since robin wasn't stored in a variable
      nightwing: updatedUsers.nightwing,
      aang: updatedUsers.aang,
      katara: updatedUsers.katara,
      sokka: updatedUsers.sokka,
      toph: updatedUsers.toph,
      zuko: updatedUsers.zuko,
      monopolyMan,
      mrKrabs,
      richieRich,
      johnBoddy,
      regina: updatedUsers.regina,
      cady: updatedUsers.cady,
      gretchen: updatedUsers.gretchen,
      karen: updatedUsers.karen,
      spongebob: updatedUsers.spongebob,
      patrick: updatedUsers.patrick,
      squidward: updatedUsers.squidward,
      sandy: updatedUsers.sandy,
      pearl: updatedUsers.pearl,
      larry: updatedUsers.larry
    },
    {
      tesla: vendorTesla,
      amazon: vendorAmazon,
      google: vendorGoogle,
      microsoft: vendorMicrosoft,
      apple: vendorApple,
      costco: vendorCostco,
      walmart: vendorWalmart,
      target: vendorTarget
    },
    {
      cash: indexCodeCash,
      budget: indexCodeBudget
    },
    {
      equipment: accountCode,
      things: accountCode2,
      stuff: accountCode3
    },
    ner
  );

  const otherProductReasonConsumables = await ReimbursementRequestService.createOtherReasonReimbursementProduct(
    'CONSUMABLES',
    10,
    indexCodeCash.indexCodeId,
    [accountCode.accountCodeId],
    thomasEmrax,
    ner
  );

  const otherProductReasonTools = await ReimbursementRequestService.createOtherReasonReimbursementProduct(
    'TOOLS_AND_EQUIPMENT',
    10,
    indexCodeCash.indexCodeId,
    [],
    thomasEmrax,
    ner
  );

  const otherProductReasonComp = await ReimbursementRequestService.createOtherReasonReimbursementProduct(
    'COMPETITION',
    10,
    indexCodeBudget.indexCodeId,
    [accountCode.accountCodeId],
    thomasEmrax,
    ner
  );

  const otherProductReasonGeneral = await ReimbursementRequestService.createOtherReasonReimbursementProduct(
    'GENERAL_STOCK',
    10,
    indexCodeBudget.indexCodeId,
    [],
    thomasEmrax,
    ner
  );

  const otherProductReasonSub = await ReimbursementRequestService.createOtherReasonReimbursementProduct(
    'SUBSCRIPTIONS_AND_MEMBERSHIP',
    10,
    indexCodeCash.indexCodeId,
    [],
    thomasEmrax,
    ner
  );

  const budgetCR = await ChangeRequestsService.createBudgetChangeRequest(
    thomasEmrax,
    50,
    ner,
    otherProductReasonConsumables.otherProductReasonId
  );

  /**
   * Bill of Materials
   */
  await BillOfMaterialsService.createManufacturer(thomasEmrax, 'Digikey', ner);
  await BillOfMaterialsService.createMaterialType('Resistor', thomasEmrax, ner);

  const assembly1 = await BillOfMaterialsService.createAssembly(
    '1',
    thomasEmrax,
    {
      carNumber: car25.wbsElement.carNumber,
      projectNumber: 1,
      workPackageNumber: 0
    },
    ner
  );

  await BillOfMaterialsService.createMaterial(
    thomasEmrax,
    '10k Resistor',
    MaterialStatus.Ordered,
    'Resistor',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    {
      carNumber: car25.wbsElement.carNumber,
      projectNumber: 1,
      workPackageNumber: 0
    },
    ner,
    'Digikey',
    'abcdef',
    new Decimal(20),
    30,
    'Here are some notes',
    assembly1.assemblyId,
    undefined,
    undefined
  );

  await BillOfMaterialsService.createMaterial(
    thomasEmrax,
    '20k Resistor',
    MaterialStatus.Ordered,
    'Resistor',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    {
      carNumber: car25.wbsElement.carNumber,
      projectNumber: 1,
      workPackageNumber: 0
    },
    ner,
    'Digikey',
    'bacfed',
    new Decimal(10),
    7,
    'Here are some more notes',
    undefined,
    undefined,
    undefined
  );

  await BillOfMaterialsService.createMaterial(
    thomasEmrax,
    '100k Resistor',
    MaterialStatus.ReadyToOrder,
    'Resistor',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    {
      carNumber: car25.wbsElement.carNumber,
      projectNumber: 1,
      workPackageNumber: 0
    },
    ner,
    'Digikey',
    'lalsd',
    new Decimal(5),
    10,
    undefined,
    undefined,
    undefined
  );

  // Need to do this because the design review cannot be scheduled for a past day
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);

  /*
  const designReview1 = await DesignReviewsService.createDesignReview(
    batman,
    nextDay.toDateString(),
    mechanical.teamTypeId,
    [thomasEmrax.userId, batman.userId],
    [superman.userId, wonderwoman.userId],
    {
      carNumber: car25.wbsElement.carNumber,
      projectNumber: 1,
      workPackageNumber: 0
    },
    [3, 4, 5, 6, 7],
    ner
  );

  await DesignReviewsService.editDesignReview(
    batman,
    designReview1.designReviewId,
    nextDay,
    mechanical.teamTypeId,
    [thomasEmrax.userId, batman.userId, superman.userId, wonderwoman.userId],
    [joeBlow.userId, joeShmoe.userId, aang.userId],
    false,
    true,
    null,
    'The Bay',
    null,
    DesignReviewStatus.CONFIRMED,
    [thomasEmrax.userId, batman.userId],
    [1, 2, 3, 4, 5, 6, 7],
    ner
  );
  */

  const newWorkPackageChangeRequest = await ChangeRequestsService.createStandardChangeRequest(
    batman,
    projectHuskies2WbsNumber.carNumber,
    projectHuskies2WbsNumber.projectNumber,
    projectHuskies2WbsNumber.workPackageNumber,
    'This is a wpchange test',
    ner
  );
  await ChangeRequestsService.reviewChangeRequest(joeShmoe, newWorkPackageChangeRequest.crId, true, ner, 'create wp');

  const { workPackageWbsNumber: workPackage9WbsNumber } = await seedWorkPackage(
    thomasEmrax,
    'Slim and Light Car',
    newWorkPackageChangeRequest.crId,
    WorkPackageStage.Design,
    toDateString(weeksAgo(2)),
    5,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Inactive,
    joeShmoe.userId,
    thomasEmrax.userId,
    projectHuskies2WbsNumber,
    ner
  );

  await ChangeRequestsService.createStandardChangeRequest(
    joeShmoe,
    workPackage9WbsNumber.carNumber,
    workPackage9WbsNumber.projectNumber,
    workPackage9WbsNumber.workPackageNumber,
    'This is editing a wp through CR',
    ner
  );

  await WbsElementTemplatesService.createWorkPackageTemplate(
    batman,
    'Batmobile Config 1',
    'This is the first Batmobile configuration',
    'Batman Template',
    WorkPackageStage.Install,
    5,
    [],
    [],
    ner
  );

  const schematicWpTemplate = await WbsElementTemplatesService.createWorkPackageTemplate(
    batman,
    'Schematic',
    'This is the schematic template',
    'Schematic Template',
    WorkPackageStage.Design,
    2,
    [],
    [],
    ner
  );

  await WbsElementTemplatesService.createWorkPackageTemplate(
    batman,
    'Layout ',
    'This is the Layout  template',
    'Layout Template',
    WorkPackageStage.Manufacturing,
    4,
    [],
    [schematicWpTemplate.workPackageTemplateId],
    ner
  );

  await OrganizationsService.setFeaturedProjects(
    [projectHuskies1Id, projectHuskies2Id, projectHuskies3Id, projectHuskies4Id],
    ner,
    thomasEmrax
  );

  await WbsElementTemplatesService.createProjectTemplate(
    batman,
    'Project Template 1',
    'This is the first project template',
    [],
    ner,
    [],
    [],
    'This project is very cool',
    undefined,
    'Awesome Project'
  );

  await OrganizationsService.setUsefulLinks(batman, organizationId, [
    {
      linkId: '1',
      linkTypeName: 'Confluence',
      url: 'https://confluence.com'
    },
    {
      linkId: '2',
      linkTypeName: 'Bill of Materials',
      url: 'https://docs.google.com'
    },
    {
      linkId: '3',
      linkTypeName: 'NER Website',
      url: 'https://electricracing.northeastern.edu/'
    },
    {
      linkId: '4',
      linkTypeName: 'NER Instagram',
      url: 'https://www.instagram.com/nuelectricracing/'
    }
  ]);

  await OrganizationsService.setOnboardingText(
    batman,
    ner,
    'Thank you for applying to Northeastern Electric Racing! After reviewing your application, we are very excited to officially welcome you to our team.'
  );

  await OrganizationsService.updateOrganizationContacts(batman, ner, [
    { userId: batman.userId, title: 'Chief Software Engineer' },
    { userId: thomasEmrax.userId, title: 'Chief Mechanical Engineer' },
    { userId: regina.userId, title: 'Chief Electrical Engineer' }
  ]);

  await RecruitmentServices.createMilestone(batman, 'Club fair!', 'Also meet us at:', daysAgo(120), ner);
  await RecruitmentServices.createMilestone(batman, 'Applications Open', '', daysAgo(70), ner);
  await RecruitmentServices.createMilestone(batman, 'Applications Close', '', daysAgo(56), ner);
  await RecruitmentServices.createMilestone(batman, 'Decision Day!', '', daysAgo(49), ner);

  await RecruitmentServices.createOrganizationFaq(batman, 'Who is the Chief Software Engineer?', 'Peyton McKee', ner);
  await RecruitmentServices.createOrganizationFaq(
    batman,
    'When was FinishLine created?',
    'FinishLine was created in 2019',
    ner
  );
  await RecruitmentServices.createOrganizationFaq(
    batman,
    'How many developers are working on FinishLine?',
    '178 as of 2024',
    ner
  );

  await prisma.frequentlyAskedQuestion.create({
    data: {
      faqId: '1',
      question: 'question',
      answer: 'answer',
      userCreated: { connect: { userId: batman.userId } },
      dateCreated: new Date(),
      partReviewFaqOrg: { connect: { organizationId: ner.organizationId } }
    }
  });

  await AnnouncementService.createAnnouncement(
    'Welcome to Finishline!',
    [regina.userId],
    new Date(),
    'Thomas Emrax',
    '1',
    'software',
    ner.organizationId
  );

  await AnnouncementService.createAnnouncement(
    'Welcome to Finishline!',
    [regina.userId],
    new Date(),
    'Damian',
    '2',
    'mechanical',
    ner.organizationId
  );

  await AnnouncementService.createAnnouncement(
    'Welcome to Finishline!',
    [regina.userId],
    new Date(),
    'Batman',
    '3',
    'powertrain',
    ner.organizationId
  );

  const joinSlackChecklist = await OnboardingServices.createChecklist(batman, 'Join Slack', null, null, null, ner, false);

  await OnboardingServices.createChecklist(
    batman,
    'Put your name and pronouns',
    null,
    null,
    joinSlackChecklist.checklistId,
    ner,
    false
  );

  await OnboardingServices.createChecklist(
    batman,
    'Include your team and/or subteam',
    null,
    null,
    joinSlackChecklist.checklistId,
    ner,
    false
  );

  await OnboardingServices.createChecklist(
    batman,
    'Include your major and/or year',
    null,
    null,
    joinSlackChecklist.checklistId,
    ner,
    true
  );

  await OnboardingServices.createChecklist(
    batman,
    'Turn on notifications',
    null,
    null,
    joinSlackChecklist.checklistId,
    ner,
    false
  );

  const learnGitChecklist = await OnboardingServices.createChecklist(
    batman,
    'Learn how to use git',
    null,
    software.teamTypeId,
    null,
    ner,
    false
  );

  await OnboardingServices.createChecklist(
    batman,
    'Create your first project',
    null,
    software.teamTypeId,
    learnGitChecklist.checklistId,
    ner,
    false
  );

  /**
   * PARTS
   */
  let i = 0;
  for (const testPart of Object.values(dbSeedAllParts)) {
    const requester = i % 2 === 0 ? batman.userId : thomasEmrax.userId;
    const partArgs = testPart(projectHuskies2Id, requester, [hawkMan.userId]);
    await prisma.part.create({ data: partArgs.data });
    i++;
  }

  // Add part tags
  const mechanicalPartTag: Part_Tag = await prisma.part_Tag.create(dbSeedAllPartTags.MechanicalPartTag(organizationId));
  const electricalPartTag: Part_Tag = await prisma.part_Tag.create(dbSeedAllPartTags.ElectricalPartTag(organizationId));
  const structuralPartTag: Part_Tag = await prisma.part_Tag.create(dbSeedAllPartTags.StructuralPartTag(organizationId));

  await CreatePartTag(organizationId, 'Practice', '#202025');

  await CreatePartTag(organizationId, 'Complex', '#142099');

  await CreatePartTag(organizationId, 'Expensive', '#FF0000');

  await CreateCommonMistake(
    'Stubbing Toes in the Bay',
    'This is a common mistake. In order to prevent this, it is important to wear closed toed shoes and make sure all parts handled with care.',
    false,
    batman,
    organizationId
  );

  await CreateCommonMistake(
    'Not wearing PPE',
    'This is another common mistake. Ensuring that you have proper PPE coverage is essential when doing any work in the bay. If you are unsure about any PPE requirements, dont hesitate to reach out to a team lead. ',
    true,
    superman,
    organizationId
  );

  await CreatePartReviewFAQ(
    'What is a part review?',
    'A Part review allows for your team lead to ensure that your part is designed correctly and meets your specified restrictions.',
    organizationId,
    batman
  );

  await CreatePartReviewFAQ(
    'How do I upload for a part review?',
    'First, click the button to upload your file. After uploading your file it is important to make sure that you tag it correctly, and that all fields are filled out in a way that makes sense to your part. After that, click submit and let your team lead know!',
    organizationId,
    superman
  );

  // example part for a tire
  const part1Example = await prisma.part.create({
    data: {
      partId: '001',
      index: 100,
      commonName: 'tire',
      project: {
        connect: { projectId: projectHuskies1Id }
      },
      userCreated: {
        connect: { userId: batman.userId }
      }
    }
  });

  // example part for an engine
  const part2Example = await prisma.part.create({
    data: {
      partId: '002',
      index: 100,
      commonName: 'engine',
      project: {
        connect: { projectId: projectHuskies2Id }
      },
      userCreated: {
        connect: { userId: flash.userId }
      }
    }
  });

  // example part for a door
  const part3Example = await prisma.part.create({
    data: {
      partId: '003',
      index: 100,
      commonName: 'door',
      project: {
        connect: { projectId: projectHuskies3Id }
      },
      userCreated: {
        connect: { userId: zuko.userId }
      }
    }
  });

  // const reviewRequest1 = await prisma.partReviewRequest.create({
  //   data: {
  //     partReviewRequestId: '001',
  //     requesterId: hawkMan.userId,
  //     reviewerId: batman.userId,

  //   }
  // });

  const part4Example = await prisma.part.create({
    data: {
      partId: '004',
      index: 100,
      commonName: 'barrel',
      status: 'IN_PROGRESS',
      project: {
        connect: { projectId: projectJustice1Id }
      },
      userCreated: {
        connect: { userId: batman.userId }
      },
      assignees: {
        connect: { userId: hawkMan.userId }
      },
      reviewRequests: {
        create: {
          partReviewRequestId: '001',
          requesterId: hawkMan.userId,
          reviewerId: batman.userId
        }
      }
    }
  });

  const part5Example = await prisma.part.create({
    data: {
      partId: '005',
      index: 101,
      commonName: 'particle accelerator',
      status: 'READY_FOR_REVIEW',
      project: {
        connect: { projectId: projectJustice1Id }
      },
      userCreated: {
        connect: { userId: batman.userId }
      },
      assignees: {
        connect: { userId: hawkMan.userId }
      },
      reviewRequests: {
        create: {
          partReviewRequestId: '002',
          requesterId: hawkMan.userId,
          reviewerId: batman.userId
        }
      }
    }
  });

  const part6Example = await prisma.part.create({
    data: {
      partId: '006',
      index: 102,
      commonName: 'kill switch',
      status: 'IN_REVIEW',
      project: {
        connect: { projectId: projectJustice1Id }
      },
      userCreated: {
        connect: { userId: batman.userId }
      },
      assignees: {
        connect: { userId: hawkMan.userId }
      },
      reviewRequests: {
        create: {
          partReviewRequestId: '003',
          requesterId: hawkMan.userId,
          reviewerId: batman.userId
        }
      }
    }
  });

  const part7Example = await prisma.part.create({
    data: {
      partId: '007',
      index: 103,
      commonName: 'self-destruct button',
      status: 'REVIEWED',
      project: {
        connect: { projectId: projectJustice1Id }
      },
      userCreated: {
        connect: { userId: batman.userId }
      },
      assignees: {
        connect: { userId: hawkMan.userId }
      },
      reviewRequests: {
        create: {
          partReviewRequestId: '004',
          requesterId: hawkMan.userId,
          reviewerId: batman.userId
        }
      }
    }
  });

  const part8Example = await prisma.part.create({
    data: {
      partId: '008',
      index: 104,
      commonName: 'anti-jonkler serum',
      status: 'APPROVED',
      project: {
        connect: { projectId: projectJustice1Id }
      },
      userCreated: {
        connect: { userId: batman.userId }
      },
      assignees: {
        connect: { userId: hawkMan.userId }
      },
      reviewRequests: {
        create: {
          partReviewRequestId: '005',
          requesterId: hawkMan.userId,
          reviewerId: batman.userId
        }
      }
    }
  });

  const part9Example = await prisma.part.create({
    data: {
      partId: '009',
      index: 105,
      commonName: 'huge battery',
      status: 'IN_PROGRESS',
      project: {
        connect: { projectId: projectJustice1Id }
      },
      userCreated: {
        connect: { userId: batman.userId }
      },
      assignees: {
        connect: { userId: flash.userId }
      },
      reviewRequests: {
        create: {
          partReviewRequestId: '006',
          requesterId: hawkMan.userId,
          reviewerId: batman.userId
        }
      }
    }
  });

  const part10Example = await prisma.part.create({
    data: {
      partId: '010',

      index: 106,
      commonName: 'small battery',
      status: 'APPROVED',
      project: {
        connect: { projectId: projectJustice1Id }
      },
      userCreated: {
        connect: { userId: batman.userId }
      },
      assignees: {
        connect: { userId: flash.userId }
      },
      reviewRequests: {
        create: {
          partReviewRequestId: '007',
          requesterId: hawkMan.userId,
          reviewerId: batman.userId
        }
      }
    }
  });

  const partSubmissionExample1 = await prisma.part_Submission.create({
    data: {
      partSubmissionId: 'submissionId001',
      fileIds: ['file1', 'file2'],
      name: 'tire',
      notes: 'black, round',
      part: {
        connect: { partId: part1Example.partId }
      },
      userCreated: {
        connect: { userId: batman.userId }
      }
    }
  });

  const partSubmissionExample2 = await prisma.part_Submission.create({
    data: {
      partSubmissionId: 'submissionId002',
      fileIds: ['file3'],
      name: 'engine',
      notes: 'this is the car engine',
      part: {
        connect: { partId: part2Example.partId }
      },
      userCreated: {
        connect: { userId: flash.userId }
      }
    }
  });

  const partSubmissionExample3 = await prisma.part_Submission.create({
    data: {
      partSubmissionId: 'submissionId003',
      fileIds: ['file4', 'file5', 'file6'],
      name: 'door',
      notes: 'car door',
      part: {
        connect: { partId: part3Example.partId }
      },
      userCreated: {
        connect: { userId: zuko.userId }
      }
    }
  });

  const partReviewExample1 = await prisma.part_Review.create({
    data: {
      partReviewId: 'reviewId001',
      fileIds: ['file1', 'file2'],
      notes: 'this part submission sucks!!',
      submission: {
        connect: {
          partSubmissionId: partSubmissionExample1.partSubmissionId
        }
      },
      userCreated: {
        connect: { userId: appa.userId }
      }
    }
  });

  const partReviewExample2 = await prisma.part_Review.create({
    data: {
      partReviewId: 'reviewId002',
      fileIds: ['file3'],
      notes: 'this part submission rocks!!',
      submission: {
        connect: {
          partSubmissionId: partSubmissionExample2.partSubmissionId
        }
      },
      userCreated: {
        connect: { userId: joeShmoe.userId }
      }
    }
  });

  const partReviewExample3 = await prisma.part_Review.create({
    data: {
      partReviewId: 'reviewId003',
      fileIds: ['file5', 'file6'],
      notes: 'this part submission is decent!!',
      submission: {
        connect: {
          partSubmissionId: partSubmissionExample3.partSubmissionId
        }
      },
      userCreated: {
        connect: { userId: lamarJackson.userId }
      }
    }
  });

  const goldSponsorTier = await FinanceServices.createSponsorTier(thomasEmrax, 'Gold', ner, '#9F9156', 3000);
  const silverSponsorTier = await FinanceServices.createSponsorTier(thomasEmrax, 'Silver', ner, '#C0C0C0', 200);
  const bronzeSponsorTier = await FinanceServices.createSponsorTier(thomasEmrax, 'Bronze', ner, '#CD7F32', 10);

  // Sponsors
  const sponsor = await FinanceServices.createSponsor(
    thomasEmrax,
    'Google',
    true,
    ['MONETARY'],
    daysAgo(90),
    [2024, 2025],
    goldSponsorTier.sponsorTierId,
    true,
    'Bill Gates',
    [],
    ner,
    5000,
    'googlecode',
    undefined,
    'bill@google.com'
  );

  await FinanceServices.createSponsorTask(
    thomasEmrax,
    ner,
    daysFromNow(30),
    'Send Google mid-year impact report with project highlights',
    sponsor.sponsorId,
    daysFromNow(20),
    superman.userId
  );

  const altiumSponsor = await FinanceServices.createSponsor(
    thomasEmrax,
    'Altium',
    true,
    ['DISCOUNT'],
    daysAgo(200),
    [2024, 2025, 2026],
    silverSponsorTier.sponsorTierId,
    false,
    'Rachel Park',
    [],
    ner,
    undefined,
    undefined,
    undefined,
    'rpark@altium.com',
    undefined,
    'Director of Academic Programs',
    undefined,
    'Free Altium Designer licenses for all team members'
  );

  const mcmasterSponsor = await FinanceServices.createSponsor(
    thomasEmrax,
    'McMaster-Carr',
    true,
    ['STOCK'],
    daysAgo(60),
    [2025, 2026],
    bronzeSponsorTier.sponsorTierId,
    true,
    'James Corrado',
    [],
    ner,
    undefined,
    undefined,
    'Provides fasteners and raw materials at no cost',
    'jcorrado@mcmaster.com',
    '555-444-3333',
    'Account Representative',
    '$500 worth of stock hardware per semester'
  );

  const boseSponsor = await FinanceServices.createSponsor(
    thomasEmrax,
    'Bose Corporation',
    true,
    ['MONETARY', 'STOCK'],
    daysAgo(150),
    [2025, 2026],
    goldSponsorTier.sponsorTierId,
    true,
    'Linda Morales',
    [],
    ner,
    8000,
    undefined,
    undefined,
    'lmorales@bose.com',
    '555-222-1111',
    'Engineering Partnerships',
    'Donates sensors and audio components'
  );

  await FinanceServices.createSponsor(
    thomasEmrax,
    'ANSYS',
    false,
    ['DISCOUNT'],
    daysAgo(400),
    [2023, 2024],
    silverSponsorTier.sponsorTierId,
    false,
    'Tom Bradley',
    [],
    ner,
    undefined,
    'ANSYS-NER-2024',
    'Sponsorship ended after 2024 season',
    'tbradley@ansys.com',
    undefined,
    'University Partnerships',
    undefined,
    '50% discount on simulation software suite'
  );

  const neuSponsor = await FinanceServices.createSponsor(
    thomasEmrax,
    'Northeastern University COE',
    true,
    ['MONETARY'],
    daysAgo(365),
    [2024, 2025, 2026],
    goldSponsorTier.sponsorTierId,
    true,
    'Dr. Amy Sullivan',
    [],
    ner,
    15000,
    undefined,
    'Annual funding from the College of Engineering',
    'a.sullivan@northeastern.edu',
    undefined,
    'Associate Dean of Student Organizations'
  );

  // Prospective sponsors
  const prospectiveContact1 = await prisma.sponsor_Contact.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@teslamotors.com',
      phone: '555-123-4567',
      position: 'Partnerships Manager'
    }
  });

  const prospectiveContact2 = await prisma.sponsor_Contact.create({
    data: {
      name: 'Mike Callahan',
      email: 'mcallahan@boeingaero.com',
      position: 'University Relations Lead'
    }
  });

  const prospectiveContact3 = await prisma.sponsor_Contact.create({
    data: {
      name: 'Emily Davis',
      email: 'emily.d@solidworks.com',
      phone: '555-987-6543',
      position: 'Academic Sponsorships'
    }
  });

  const prospectiveContact4 = await prisma.sponsor_Contact.create({
    data: {
      name: 'Kevin Martinez',
      email: 'kmartinez@ti.com',
      phone: '555-321-7890',
      position: 'University Programs Coordinator'
    }
  });

  const prospectiveContact5 = await prisma.sponsor_Contact.create({
    data: {
      name: 'Priya Patel',
      email: 'priya.patel@3m.com',
      position: 'Technical Sponsorships'
    }
  });

  const prospectiveContact6 = await prisma.sponsor_Contact.create({
    data: {
      name: 'David Romano',
      phone: '555-654-0987',
      position: 'Owner'
    }
  });

  const prospectiveContact7 = await prisma.sponsor_Contact.create({
    data: {
      name: 'Amanda Foster',
      email: 'afoster@shell.com',
      phone: '555-111-2222',
      position: 'STEM Outreach Manager'
    }
  });

  const prospectiveContact8 = await prisma.sponsor_Contact.create({
    data: {
      name: 'Robert Whitfield',
      email: 'rwhitfield@mathworks.com',
      position: 'Academic Sales'
    }
  });

  const teslaProsSpons = await prisma.prospective_Sponsor.create({
    data: {
      organizationId,
      organizationName: 'Tesla Motors',
      lastContactDate: daysAgo(5),
      highlightThresholdDays: 14,
      status: 'IN_PROGRESS',
      firstContactMethod: 'OUTBOUND_EMAIL',
      contactorUserId: lexLuther.userId,
      contactId: prospectiveContact1.sponsorContactId,
      notes: 'Reached out about potential parts sponsorship for battery systems'
    }
  });

  await prisma.prospective_Sponsor.create({
    data: {
      organizationId,
      organizationName: 'Boeing Aerospace',
      lastContactDate: daysAgo(20),
      highlightThresholdDays: 10,
      status: 'NO_RESPONSE',
      firstContactMethod: 'OUTBOUND_EMAIL',
      contactorUserId: wonderwoman.userId,
      contactId: prospectiveContact2.sponsorContactId,
      notes: 'Sent initial sponsorship proposal, no reply yet'
    }
  });

  const solidworksProsSpons = await prisma.prospective_Sponsor.create({
    data: {
      organizationId,
      organizationName: 'SolidWorks',
      lastContactDate: daysAgo(2),
      highlightThresholdDays: 7,
      status: 'IN_PROGRESS',
      firstContactMethod: 'INBOUND_EMAIL',
      contactorUserId: flash.userId,
      contactId: prospectiveContact3.sponsorContactId,
      notes: 'They reached out offering software licenses for the team'
    }
  });

  const tiProsSpons = await prisma.prospective_Sponsor.create({
    data: {
      organizationId,
      organizationName: 'Texas Instruments',
      lastContactDate: daysAgo(3),
      highlightThresholdDays: 10,
      status: 'IN_PROGRESS',
      firstContactMethod: 'INBOUND_FORM',
      contactorUserId: aquaman.userId,
      contactId: prospectiveContact4.sponsorContactId,
      notes: 'Filled out our sponsorship interest form, interested in providing microcontrollers and dev boards'
    }
  });

  await prisma.prospective_Sponsor.create({
    data: {
      organizationId,
      organizationName: '3M',
      lastContactDate: daysAgo(45),
      highlightThresholdDays: 14,
      status: 'NOT_IN_CONTACT',
      firstContactMethod: 'OUTBOUND_EMAIL',
      contactorUserId: thomasEmrax.userId,
      contactId: prospectiveContact5.sponsorContactId,
      notes: 'Initial contact went well but contact person changed roles, need to find new point of contact'
    }
  });

  await prisma.prospective_Sponsor.create({
    data: {
      organizationId,
      organizationName: 'Precision Machine Shop Boston',
      lastContactDate: daysAgo(8),
      highlightThresholdDays: 10,
      status: 'IN_PROGRESS',
      firstContactMethod: 'OTHER',
      contactorUserId: batman.userId,
      contactId: prospectiveContact6.sponsorContactId,
      notes: 'Met at local manufacturing expo, interested in providing machining services at reduced cost'
    }
  });

  await prisma.prospective_Sponsor.create({
    data: {
      organizationId,
      organizationName: 'Shell Energy',
      lastContactDate: daysAgo(30),
      highlightThresholdDays: 14,
      status: 'DECLINED',
      firstContactMethod: 'OUTBOUND_EMAIL',
      contactorUserId: superman.userId,
      contactId: prospectiveContact7.sponsorContactId,
      notes: 'Declined for this year, suggested we reapply next fiscal year in September'
    }
  });

  const mathworksProsSpons = await prisma.prospective_Sponsor.create({
    data: {
      organizationId,
      organizationName: 'MathWorks',
      lastContactDate: daysAgo(1),
      highlightThresholdDays: 7,
      status: 'IN_PROGRESS',
      firstContactMethod: 'INBOUND_EMAIL',
      contactorUserId: lexLuther.userId,
      contactId: prospectiveContact8.sponsorContactId,
      notes: 'Interested in providing MATLAB/Simulink licenses, scheduling a call next week'
    }
  });

  // Sponsor tasks
  await FinanceServices.createSponsorTask(
    thomasEmrax,
    ner,
    daysFromNow(14),
    'Renew Altium license agreement for next academic year',
    altiumSponsor.sponsorId,
    daysFromNow(7),
    thomasEmrax.userId
  );

  await FinanceServices.createSponsorTask(
    thomasEmrax,
    ner,
    daysFromNow(60),
    'Send McMaster-Carr updated parts list for spring semester',
    mcmasterSponsor.sponsorId,
    daysFromNow(45),
    lexLuther.userId
  );

  await FinanceServices.createSponsorTask(
    thomasEmrax,
    ner,
    daysAgo(5),
    'Submit Bose quarterly progress report',
    boseSponsor.sponsorId,
    daysAgo(10),
    wonderwoman.userId
  );

  await FinanceServices.createSponsorTask(
    thomasEmrax,
    ner,
    daysFromNow(90),
    'Prepare annual sponsorship renewal presentation for NEU COE',
    neuSponsor.sponsorId,
    daysFromNow(60),
    batman.userId
  );

  await FinanceServices.createSponsorTask(
    thomasEmrax,
    ner,
    daysFromNow(7),
    'Send thank-you letter and team photo to Bose',
    boseSponsor.sponsorId,
    undefined,
    aquaman.userId
  );

  // Prospective sponsor tasks
  await prisma.sponsor_Task.create({
    data: {
      dueDate: daysFromNow(3),
      notes: 'Follow up email with Tesla partnership proposal PDF',
      prospectiveSponsorId: teslaProsSpons.prospectiveSponsorId,
      notifyDate: daysFromNow(1),
      assigneeUserId: lexLuther.userId
    }
  });

  await prisma.sponsor_Task.create({
    data: {
      dueDate: daysFromNow(10),
      notes: 'Schedule demo call with SolidWorks academic team',
      prospectiveSponsorId: solidworksProsSpons.prospectiveSponsorId,
      assigneeUserId: flash.userId
    }
  });

  await prisma.sponsor_Task.create({
    data: {
      dueDate: daysAgo(2),
      notes: 'Send TI the team roster for university program enrollment',
      prospectiveSponsorId: tiProsSpons.prospectiveSponsorId,
      notifyDate: daysAgo(5),
      assigneeUserId: aquaman.userId,
      done: true
    }
  });

  await prisma.sponsor_Task.create({
    data: {
      dueDate: daysFromNow(5),
      notes: 'Prepare MathWorks sponsorship tier options document',
      prospectiveSponsorId: mathworksProsSpons.prospectiveSponsorId,
      notifyDate: daysFromNow(2),
      assigneeUserId: lexLuther.userId
    }
  });

  await prisma.sponsor_Task.create({
    data: {
      dueDate: daysFromNow(14),
      notes: 'Draft MATLAB workshop proposal to show value of partnership',
      prospectiveSponsorId: mathworksProsSpons.prospectiveSponsorId,
      assigneeUserId: wonderwoman.userId
    }
  });

  // Create shops for machinery
  const advancedShop = await prisma.shop.create({
    data: {
      name: 'Advanced CNC Manufacturing Center',
      description: 'CNC machining and precision manufacturing facility',
      userCreatedId: thomasEmrax.userId,
      organizationId
    }
  });

  const electronicsLab = await prisma.shop.create({
    data: {
      name: 'Electronics Development Lab',
      description: 'Electronics testing and development workspace',
      userCreatedId: thomasEmrax.userId,
      organizationId
    }
  });

  const testingFacility = await prisma.shop.create({
    data: {
      name: 'Testing & Validation Facility',
      description: 'Component and system testing laboratory',
      userCreatedId: thomasEmrax.userId,
      organizationId
    }
  });

  // Create machineries and assign to shops
  const ironMachineCreated = await CalendarService.createMachinery(thomasEmrax, 'Iron Man CNC Mill', ner);
  const ironMachine = await CalendarService.addMachineryToShop(
    thomasEmrax,
    ironMachineCreated.machineryId,
    advancedShop.shopId,
    1,
    ner
  );
  const hammerCreated = await CalendarService.createMachinery(thomasEmrax, 'Thor Hammer Lathe', ner);
  const hammer = await CalendarService.addMachineryToShop(
    thomasEmrax,
    hammerCreated.machineryId,
    advancedShop.shopId,
    2,
    ner
  );
  const printerCreated = await CalendarService.createMachinery(thomasEmrax, 'Spider-Man 3D Printer', ner);
  const printer = await CalendarService.addMachineryToShop(
    thomasEmrax,
    printerCreated.machineryId,
    electronicsLab.shopId,
    1,
    ner
  );
  const captainAmericaCreated = await CalendarService.createMachinery(thomasEmrax, 'Captain America Oscilloscope', ner);
  await CalendarService.addMachineryToShop(thomasEmrax, captainAmericaCreated.machineryId, electronicsLab.shopId, 3, ner);
  const hulkCreated = await CalendarService.createMachinery(thomasEmrax, 'Hulk Dynamometer', ner);
  await CalendarService.addMachineryToShop(thomasEmrax, hulkCreated.machineryId, testingFacility.shopId, 1, ner);
  const blackWidowCreated = await CalendarService.createMachinery(thomasEmrax, 'Black Widow Thermal Camera', ner);
  await CalendarService.addMachineryToShop(thomasEmrax, blackWidowCreated.machineryId, testingFacility.shopId, 2, ner);

  // various calendars for testing
  const calendar = await CalendarService.createCalendar(
    thomasEmrax,
    'Engineering Team Calendar',
    'Tracks all engineering team events, meetings, and deadlines.',
    '#3498db',
    ner
  );

  const calendarFinishline = await CalendarService.createCalendar(
    thomasEmrax,
    'Finishline Projects Calendar',
    'Tracks all ongoing projects currently being developed for Finishline',
    '#911111ff',
    ner
  );

  const calendarMeta = await CalendarService.createCalendar(
    thomasEmrax,
    'Calendar Improvements Calendar',
    'Tracks all current improvements and schedulings for the improvement of the Finishline Calendar',
    '#bf40e6ff',
    ner
  );

  // meeting event type
  const meetingEventType = await CalendarService.createEventType(
    thomasEmrax,
    'Meeting',
    [calendar.calendarId],
    ner,
    false,
    false,
    true,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false
  );

  // design review event type
  const designReviewEventType = await CalendarService.createEventType(
    thomasEmrax,
    'Design Review',
    [calendar.calendarId],
    ner,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    false,
    true,
    true
  );

  // manufacturing event type
  const manufacturingEventType = await CalendarService.createEventType(
    thomasEmrax,
    'Manufacturing',
    [],
    ner,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false
  );

  // bay time event type
  const bayTimeEventType = await CalendarService.createEventType(
    thomasEmrax,
    'Bay Time',
    [],
    ner,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  );

  await CalendarService.createEvent(
    thomasEmrax,
    'Weekly Team Sync',
    meetingEventType.eventTypeId,
    ner,
    [],
    [],
    [justiceLeague.teamId],
    [],
    [],
    [],
    [
      {
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
        allDay: false
      }
    ],
    undefined,
    mechanical.teamTypeId,
    undefined,
    'Conference Room A',
    'https://zoom.us/j/123456789',
    'Test meeting'
  );

  await CalendarService.createEvent(
    thomasEmrax,
    'Weekly Team Sync Late',
    meetingEventType.eventTypeId,
    ner,
    [],
    [],
    [justiceLeague.teamId],
    [],
    [],
    [],
    [
      {
        startTime: new Date(new Date().getTime() + 105 * 60 * 60 * 1000),
        endTime: new Date(new Date().getTime() + 106 * 60 * 60 * 1000),
        allDay: false
      },
      {
        startTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        endTime: new Date(new Date().getTime() + 25 * 60 * 60 * 1000),
        allDay: false
      },
      {
        startTime: new Date(new Date().getTime() + 50 * 60 * 60 * 1000),
        endTime: new Date(new Date().getTime() + 51 * 60 * 60 * 1000),
        allDay: false
      },
      {
        startTime: new Date(new Date().getTime() + 85 * 60 * 60 * 1000),
        endTime: new Date(new Date().getTime() + 87 * 60 * 60 * 1000),
        allDay: false
      }
    ],
    undefined,
    mechanical.teamTypeId,
    undefined,
    'Conference Room A',
    'https://zoom.us/j/123456789',
    'December Cheer'
  );

  await CalendarService.createEvent(
    thomasEmrax,
    'Weekly Team Sync 2',
    meetingEventType.eventTypeId,
    ner,
    [],
    [],
    [justiceLeague.teamId],
    [],
    [],
    [],
    [
      {
        startTime: new Date('2025-10-21T10:00:00.000Z'),
        endTime: new Date('2025-10-21T11:00:00.000Z'),
        allDay: false
      }
    ],
    undefined,
    mechanical.teamTypeId,
    undefined,
    'Conference Room A',
    'https://zoom.us/j/123456789',
    'This is the second Weekly Sync in our database. Please come and join to get vital information! Thank you for reading.'
  );

  await CalendarService.createEvent(
    thomasEmrax,
    'Weekly Team Sync 3',
    meetingEventType.eventTypeId,
    ner,
    [],
    [],
    [justiceLeague.teamId],
    [],
    [],
    [],
    [
      {
        startTime: new Date('2025-10-21T10:00:00.000Z'),
        endTime: new Date('2025-10-21T11:00:00.000Z'),
        allDay: false
      }
    ],
    undefined,
    mechanical.teamTypeId,
    undefined,
    'Conference Room A',
    'https://zoom.us/j/123456789',
    'This is the third test meeting! Glad to say hi.'
  );

  await CalendarService.createEvent(
    thomasEmrax,
    'Weekly Team Sync 4',
    meetingEventType.eventTypeId,
    ner,
    [],
    [],
    [justiceLeague.teamId],
    [],
    [],
    [],
    [
      {
        startTime: new Date('2025-10-21T10:00:00.000Z'),
        endTime: new Date('2025-10-21T11:00:00.000Z'),
        allDay: false
      }
    ],
    undefined,
    mechanical.teamTypeId,
    undefined,
    'Conference Room A',
    'https://zoom.us/j/123456789',
    'This is the fourth meeting! Please come anyway, we have a lot to say.'
  );

  await CalendarService.createEvent(
    thomasEmrax,
    'Weekly Team Sync 5',
    meetingEventType.eventTypeId,
    ner,
    [],
    [],
    [justiceLeague.teamId],
    [],
    [],
    [],
    [
      {
        startTime: new Date('2025-10-21T10:00:00.000Z'),
        endTime: new Date('2025-10-21T11:00:00.000Z'),
        allDay: false
      }
    ],
    undefined,
    mechanical.teamTypeId,
    undefined,
    'Conference Room A',
    'https://zoom.us/j/123456789',
    "This one is optional, up to you if you want to show up, we won't judge"
  );

  await CalendarService.createEvent(
    thomasEmrax,
    'Impact Attenuator Design Review',
    designReviewEventType.eventTypeId,
    ner,
    [joeShmoe.userId, joeBlow.userId],
    [batman.userId],
    [],
    [],
    [],
    [workPackage3.id],
    [],
    weeksFromNow(1),
    software.teamTypeId,
    'https://docs.google.com/document/d/2_example',
    'Conference Room B',
    'https://zoom.us/j/987654321',
    undefined
  );

  await CalendarService.createEvent(
    batman,
    'Wiring Harness Manufacturing',
    manufacturingEventType.eventTypeId,
    ner,
    [regina.userId, janis.userId],
    [cady.userId],
    [],
    [electronicsLab.shopId],
    [printer.machineryId],
    [workPackage3.id],
    [
      {
        startTime: new Date('2025-10-23T09:00:00.000Z'),
        endTime: new Date('2025-10-23T12:00:00.000Z'),
        allDay: false
      }
    ],
    undefined,
    electrical.teamTypeId,
    'https://docs.google.com/document/d/3_example',
    undefined,
    undefined,
    undefined
  );

  await CalendarService.createEvent(
    aang,
    'Composite Layup Bay Time',
    bayTimeEventType.eventTypeId,
    ner,
    [katara.userId, sokka.userId],
    [],
    [],
    [],
    [ironMachine.machineryId],
    [],
    [
      {
        startTime: new Date('2025-10-24T13:00:00.000Z'),
        endTime: new Date('2025-10-24T17:00:00.000Z'),
        allDay: false
      }
    ],
    undefined,
    mechanical.teamTypeId,
    undefined,
    undefined,
    undefined,
    undefined
  );

  /* Guest Definitions */
  const guestDef1 = await prisma.guest_Definition.create({
    data: {
      term: 'NER',
      description: 'A really awesome organization!',
      order: 0,
      type: 'INFO_PAGE',
      organizationId,
      userCreatedId: batman.userId
    }
  });

  await RecruitmentServices.createGuestDefinition(
    thomasEmrax,
    ner,
    'Projects',
    'This is the definition of a project. Projects are blah blah blah',
    0,
    GuestDefinitionType.PROJECT_MANAGEMENT,
    'bar_chart',
    'Click here to view all our projects!',
    '/projects'
  );

  await RecruitmentServices.createGuestDefinition(
    thomasEmrax,
    ner,
    'Change Requests',
    'This is the definiton for a change request. Changes requests are blah blah blah',
    0,
    GuestDefinitionType.PROJECT_MANAGEMENT,
    'bar_chart',
    'Click here to view all our change requests!',
    '/change-requests'
  );

  await RecruitmentServices.createGuestDefinition(
    thomasEmrax,
    ner,
    'Gantt Chart',
    'This is the definiton for a change request. Changes requests are blah blah blah',
    0,
    GuestDefinitionType.PROJECT_MANAGEMENT,
    'bar_chart',
    'Click here to view all our projects!',
    '/gantt'
  );

  await RecruitmentServices.createGuestDefinition(
    thomasEmrax,
    ner,
    'Design Reviews',
    'This is the definiton for a design review. Design reviews are blah blah blah',
    0,
    GuestDefinitionType.PROJECT_MANAGEMENT,
    'bar_chart',
    'Click here to view all our design reviews!',
    '/design-reviews'
  );
};

performSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
