/* eslint-disable @typescript-eslint/no-unused-vars */

/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { CR_Type, Club_Accounts, PrismaClient, Scope_CR_Why_Type, Task_Priority, Task_Status, Team } from '@prisma/client';
import { createUser, dbSeedAllUsers } from './seed-data/users.seed';
import { dbSeedAllTeams } from './seed-data/teams.seed';
import ChangeRequestsService from '../services/change-requests.services';
import TeamsService from '../services/teams.services';
import {
  ClubAccount,
  DesignReviewStatus,
  MaterialStatus,
  RoleEnum,
  StandardChangeRequest,
  WbsElementStatus,
  WorkPackageStage
} from 'shared';
import TasksService from '../services/tasks.services';
import { seedProject } from './seed-data/projects.seed';
import { seedWorkPackage } from './seed-data/work-packages.seed';
import ReimbursementRequestService from '../services/reimbursement-requests.services';
import ProjectsService from '../services/projects.services';
import { Decimal } from 'decimal.js';
import DesignReviewsService from '../services/design-reviews.services';
import BillOfMaterialsService from '../services/boms.services';
import UsersService from '../services/users.services';
import { transformDate } from '../utils/datetime.utils';
import { writeFileSync } from 'fs';
import WorkPackageTemplatesService from '../services/work-package-template.services';
import OrganizationsService from '../services/organizations.service';
import RecruitmentServices from '../services/recruitment.services';

const prisma = new PrismaClient();

const performSeed: () => Promise<void> = async () => {
  const thomasEmrax = await prisma.user.create({
    data: dbSeedAllUsers.thomasEmrax,
    include: { userSettings: true, userSecureSettings: true }
  });

  const ner = await prisma.organization.create({
    data: {
      name: 'NER',
      userCreatedId: thomasEmrax.userId,
      description:
        'Northeastern Electric Racing is a student-run organization at Northeastern University building all-electric formula-style race cars from scratch to compete in Forumla Hybrid + Electric Formula SAE (FSAE).'
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
  const gretchen = await createUser(dbSeedAllUsers.gretchen, RoleEnum.LEADERSHIP, organizationId);
  const karen = await createUser(dbSeedAllUsers.karen, RoleEnum.LEADERSHIP, organizationId);
  const janis = await createUser(dbSeedAllUsers.janis, RoleEnum.LEADERSHIP, organizationId);
  const aaron = await createUser(dbSeedAllUsers.aaron, RoleEnum.LEADERSHIP, organizationId);
  const cady = await createUser(dbSeedAllUsers.cady, RoleEnum.LEADERSHIP, organizationId);
  const damian = await createUser(dbSeedAllUsers.damian, RoleEnum.LEADERSHIP, organizationId);
  const glen = await createUser(dbSeedAllUsers.glen, RoleEnum.LEADERSHIP, organizationId);
  const shane = await createUser(dbSeedAllUsers.shane, RoleEnum.LEADERSHIP, organizationId);
  const june = await createUser(dbSeedAllUsers.june, RoleEnum.LEADERSHIP, organizationId);
  const kevin = await createUser(dbSeedAllUsers.kevin, RoleEnum.LEADERSHIP, organizationId);
  const norbury = await createUser(dbSeedAllUsers.norbury, RoleEnum.LEADERSHIP, organizationId);
  const carr = await createUser(dbSeedAllUsers.carr, RoleEnum.LEADERSHIP, organizationId);
  const trang = await createUser(dbSeedAllUsers.trang, RoleEnum.LEADERSHIP, organizationId);
  const regina = await createUser(dbSeedAllUsers.regina, RoleEnum.LEADERSHIP, organizationId);

  await UsersService.updateUserRole(cyborg.userId, thomasEmrax, 'APP_ADMIN', organizationId);

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

  /**
   * Make an initial change request for car 1 using the wbs of the genesis project
   */
  const changeRequest1: StandardChangeRequest = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    fergus.wbsElement.carNumber,
    fergus.wbsElement.projectNumber,
    fergus.wbsElement.workPackageNumber,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need this to initialize all the seed data'
      }
    ],
    [
      {
        description: 'Initialize seed data',
        scopeImpact: 'no scope impact',
        timelineImpact: 0,
        budgetImpact: 0
      }
    ],
    organizationId,
    null,
    null
  );

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(
    batman,
    changeRequest1.crId,
    'LGTM',
    true,
    organizationId,
    changeRequest1.proposedSolutions[0].id
  );

  /**
   * TEAMS
   */
  /** Creating Team Types */
  const teamType1 = await TeamsService.createTeamType(batman, 'Mechanical', 'YouTubeIcon', organizationId);
  const teamType2 = await TeamsService.createTeamType(thomasEmrax, 'Software', 'InstagramIcon', organizationId);
  const teamType3 = await TeamsService.createTeamType(cyborg, 'Electrical', 'SettingsIcon', organizationId);

  /** Creating Teams */
  const justiceLeague: Team = await prisma.team.create(dbSeedAllTeams.justiceLeague(batman.userId, organizationId));
  const avatarBenders: Team = await prisma.team.create(
    dbSeedAllTeams.avatarBenders(aang.userId, teamType2.teamTypeId, organizationId)
  );
  const ravens: Team = await prisma.team.create(dbSeedAllTeams.ravens(johnHarbaugh.userId, organizationId));
  const orioles: Team = await prisma.team.create(dbSeedAllTeams.orioles(brandonHyde.userId, organizationId));
  const huskies: Team = await prisma.team.create(
    dbSeedAllTeams.huskies(thomasEmrax.userId, teamType3.teamTypeId, organizationId)
  );
  const plLegends: Team = await prisma.team.create(dbSeedAllTeams.plLegends(cristianoRonaldo.userId, organizationId));
  const financeTeam: Team = await prisma.team.create(dbSeedAllTeams.financeTeam(monopolyMan.userId, organizationId));
  const slackBotTeam: Team = await prisma.team.create(dbSeedAllTeams.meanGirls(regina.userId, organizationId));

  /** Gets the current content of the .env file */
  const currentEnv = require('dotenv').config().parsed;

  currentEnv.DEV_ORGANIZATION_ID = organizationId;

  /** Write the new .env file with the organization ID */
  let stringifiedEnv = '';
  Object.keys(currentEnv).forEach((key) => {
    stringifiedEnv += `${key}=${currentEnv[key]}\n`;
  });
  writeFileSync('.env', stringifiedEnv);

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
    organizationId
  );
  await TeamsService.setTeamLeads(
    batman,
    justiceLeague.teamId,
    [wonderwoman, cyborg, martianManhunter].map((user) => user.userId),
    organizationId
  );

  await TeamsService.setTeamMembers(
    monopolyMan,
    financeTeam.teamId,
    [johnBoddy, villager, francis, victorPerkins, kingJulian].map((user) => user.userId),
    organizationId
  );
  await TeamsService.setTeamLeads(
    monopolyMan,
    financeTeam.teamId,
    [mrKrabs, richieRich].map((user) => user.userId),
    organizationId
  );

  await TeamsService.setTeamMembers(
    aang,
    avatarBenders.teamId,
    [katara, sokka, toph, zuko, iroh, azula, appa, momo, suki, yue, bumi].map((user) => user.userId),
    organizationId
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
      justinTucker
    ].map((user) => user.userId),
    organizationId
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
    organizationId
  );
  await TeamsService.setTeamMembers(
    thomasEmrax,
    huskies.teamId,
    [joeShmoe, joeBlow, reidChandler, nightwing, frostBite, snowPaws, paws, whiteTail, husky, howler, snowBite].map(
      (user) => user.userId
    ),
    organizationId
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
    organizationId
  );

  await TeamsService.setTeamMembers(
    regina,
    slackBotTeam.teamId,
    [thomasEmrax, batman, cyborg].map((user) => user.userId),
    organizationId
  );
  await TeamsService.setTeamLeads(
    regina,
    slackBotTeam.teamId,
    [gretchen, karen, aaron, glen, shane, june, kevin, norbury, carr, trang].map((user) => user.userId),
    organizationId
  );
  await TeamsService.setTeamLeads(
    regina,
    slackBotTeam.teamId,
    [janis, cady, damian].map((user) => user.userId),
    organizationId
  );

  /** Link Types */
  const confluenceLinkType = await ProjectsService.createLinkType(batman, 'Confluence', 'description', true, organizationId);

  const bomLinkType = await ProjectsService.createLinkType(batman, 'Bill of Materials', 'bar_chart', true, organizationId);

  await ProjectsService.createLinkType(batman, 'Google Drive', 'folder', true, organizationId);

  /**
   * Projects
   */

  /** Project 1 */
  const { projectWbsNumber: project1WbsNumber } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    fergus.wbsElement.carNumber,
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
    organizationId
  );

  /** Project 2 */
  const { projectWbsNumber: project2WbsNumber } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    fergus.wbsElement.carNumber,
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
    organizationId
  );

  /** Project 3 */
  const { projectWbsNumber: project3WbsNumber } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    fergus.wbsElement.carNumber,
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
    organizationId
  );

  /** Project 4 */
  const { projectWbsNumber: project4WbsNumber } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    fergus.wbsElement.carNumber,
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
    organizationId
  );

  /** Project 5 */
  const { projectWbsNumber: project5WbsNumber } = await seedProject(
    thomasEmrax,
    changeRequest1.crId,
    fergus.wbsElement.carNumber,
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
    organizationId
  );

  /** Project 6 */
  const { projectWbsNumber: project6WbsNumber } = await seedProject(
    aang,
    changeRequest1.crId,
    0,
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
    organizationId
  );

  /** Project 7 */
  const { projectWbsNumber: project7WbsNumber } = await seedProject(
    lexLuther,
    changeRequest1.crId,
    0,
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
    organizationId
  );

  /** Project 8 */
  const { projectWbsNumber: project8WbsNumber } = await seedProject(
    ryanGiggs,
    changeRequest1.crId,
    0,
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
    organizationId
  );

  /** Project 9 */
  const { projectWbsNumber: project9WbsNumber } = await seedProject(
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
    june.userId,
    glen.userId,
    organizationId
  );

  /**
   * Change Requests for Creating Work Packages
   */

  const changeRequestProject1 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    project1WbsNumber.carNumber,
    project1WbsNumber.projectNumber,
    project1WbsNumber.workPackageNumber,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need this to initialize work packages'
      }
    ],
    [
      {
        budgetImpact: 0,
        description: 'Initializing seed data',
        timelineImpact: 0,
        scopeImpact: 'no scope impact'
      }
    ],
    organizationId,
    null,
    null
  );

  const changeRequestProject1Id = changeRequestProject1.crId;

  // make a proposed solution for it
  const proposedSolution2 = await ChangeRequestsService.addProposedSolution(
    cyborg,
    changeRequestProject1Id,
    0,
    'Initializing seed data',
    0,
    'no scope impact',
    organizationId
  );

  const proposedSolution2Id = proposedSolution2.id;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(
    batman,
    changeRequestProject1Id,
    'LGTM',
    true,
    organizationId,
    proposedSolution2Id
  );

  const changeRequestProject5 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    project5WbsNumber.carNumber,
    project5WbsNumber.projectNumber,
    project5WbsNumber.workPackageNumber,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need this to initialize work packages'
      }
    ],
    [
      {
        budgetImpact: 0,
        description: 'Initializing seed data',
        timelineImpact: 0,
        scopeImpact: 'no scope impact'
      }
    ],
    organizationId,
    null,
    null
  );

  const changeRequestProject5Id = changeRequestProject5.crId;

  // make a proposed solution for it
  const proposedSolution3 = await ChangeRequestsService.addProposedSolution(
    cyborg,
    changeRequestProject5Id,
    0,
    'Initializing seed data',
    0,
    'no scope impact',
    organizationId
  );

  const proposedSolution3Id = proposedSolution3.id;
  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(
    batman,
    changeRequestProject5Id,
    'LGTM',
    true,
    organizationId,
    proposedSolution3Id
  );

  const changeRequestProject6 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    project6WbsNumber.carNumber,
    project6WbsNumber.projectNumber,
    project6WbsNumber.workPackageNumber,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need this to initialize work packages'
      }
    ],
    [
      {
        budgetImpact: 0,
        description: 'Initializing seed data',
        timelineImpact: 0,
        scopeImpact: 'no scope impact'
      }
    ],
    organizationId,
    null,
    null
  );

  const changeRequestProject6Id = changeRequestProject6.crId;

  // make a proposed solution for it
  const proposedSolution6 = await ChangeRequestsService.addProposedSolution(
    cyborg,
    changeRequestProject6Id,
    0,
    'Initializing seed data',
    0,
    'no scope impact',
    organizationId
  );

  const proposedSolution6Id = proposedSolution6.id;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(
    batman,
    changeRequestProject6Id,
    'LGTM',
    true,
    organizationId,
    proposedSolution6Id
  );

  const changeRequestProject7 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    project7WbsNumber.carNumber,
    project7WbsNumber.projectNumber,
    project7WbsNumber.workPackageNumber,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need this to initialize work packages'
      }
    ],
    [
      {
        budgetImpact: 0,
        description: 'Initializing seed data',
        timelineImpact: 0,
        scopeImpact: 'no scope impact'
      }
    ],
    organizationId,
    null,
    null
  );

  const changeRequestProject7Id = changeRequestProject7.crId;

  // make a proposed solution for it
  const proposedSolution7 = await ChangeRequestsService.addProposedSolution(
    cyborg,
    changeRequestProject7Id,
    0,
    'Initializing seed data',
    0,
    'no scope impact',
    organizationId
  );

  const proposedSolution7Id = proposedSolution7.id;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(
    batman,
    changeRequestProject7Id,
    'LGTM',
    true,
    organizationId,
    proposedSolution7Id
  );

  const changeRequestProject8 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    project8WbsNumber.carNumber,
    project8WbsNumber.projectNumber,
    project8WbsNumber.workPackageNumber,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need this to initialize work packages'
      }
    ],
    [
      {
        budgetImpact: 0,
        description: 'Initializing seed data',
        timelineImpact: 0,
        scopeImpact: 'no scope impact'
      }
    ],
    organizationId,
    null,
    null
  );

  const changeRequestProject8Id = changeRequestProject8.crId;

  // make a proposed solution for it
  const proposedSolution8 = await ChangeRequestsService.addProposedSolution(
    cyborg,
    changeRequestProject8Id,
    0,
    'Initializing seed data',
    0,
    'no scope impact',
    organizationId
  );

  const proposedSolution8Id = proposedSolution8.id;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(
    batman,
    changeRequestProject8Id,
    'LGTM',
    true,
    organizationId,
    proposedSolution8Id
  );

  const changeRequestProject9 = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    project9WbsNumber.carNumber,
    project9WbsNumber.projectNumber,
    project9WbsNumber.workPackageNumber,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need this to initialize work packages'
      }
    ],
    [
      {
        budgetImpact: 0,
        description: 'Initializing seed data',
        timelineImpact: 0,
        scopeImpact: 'no scope impact'
      }
    ],
    organizationId,
    null,
    null
  );

  const changeRequestProject9Id = changeRequestProject9.crId;

  // make a proposed solution for it
  const proposedSolution9 = await ChangeRequestsService.addProposedSolution(
    cyborg,
    changeRequestProject9Id,
    0,
    'Initializing seed data',
    0,
    'no scope impact',
    organizationId
  );

  const proposedSolution9Id = proposedSolution9.id;

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(
    batman,
    changeRequestProject9Id,
    'LGTM',
    true,
    organizationId,
    proposedSolution9Id
  );
  /**
   * Work Packages
   */
  /** Work Package 1 */
  const { workPackageWbsNumber: workPackage1WbsNumber, workPackage: workPackage1 } = await seedWorkPackage(
    joeShmoe,
    'Bodywork Concept of Design',
    changeRequestProject1Id,
    WorkPackageStage.Design,
    '01/01/2023',
    3,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Active,
    thomasEmrax.userId,
    thomasEmrax.userId,
    organizationId
  );

  const workPackage1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackage1.wbsElement.carNumber,
    workPackage1.wbsElement.projectNumber,
    workPackage1.wbsElement.workPackageNumber,
    'ACTIVATION',
    workPackage1.project.wbsElement.leadId!,
    workPackage1.project.wbsElement.managerId!,
    new Date('2024-03-25T04:00:00.000Z'),
    true,
    organizationId
  );

  await ChangeRequestsService.reviewChangeRequest(
    joeShmoe,
    workPackage1ActivationCrId,
    'Looks good to me!',
    true,
    organizationId,
    null
  );

  // await DescriptionBulletsService.checkDescriptionBullet(thomasEmrax, workPackage1.description[0].descriptionId);

  // await DescriptionBulletsService.checkDescriptionBullet(thomasEmrax, workPackage1.expectedActivities[1].descriptionId);

  // await DescriptionBulletsService.checkDescriptionBullet(thomasEmrax, workPackage1.deliverables[0].descriptionId);

  /** Work Package 2 */
  await seedWorkPackage(
    thomasEmrax,
    'Adhesive Shear Strength Test',
    changeRequestProject1Id,
    WorkPackageStage.Research,
    '01/22/2023',
    5,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Inactive,
    joeShmoe.userId,
    thomasEmrax.userId,
    organizationId
  );

  /** Work Package 3 */
  const { workPackageWbsNumber: workPackage3WbsNumber, workPackage: workPackage3 } = await seedWorkPackage(
    thomasEmrax,
    'Manufacture Wiring Harness',
    changeRequestProject5Id,
    WorkPackageStage.Manufacturing,
    '02/01/2023',
    3,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Active,
    joeShmoe.userId,
    thomasEmrax.userId,
    organizationId
  );

  const workPackage3ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackage3WbsNumber.carNumber,
    workPackage3WbsNumber.projectNumber,
    workPackage3WbsNumber.workPackageNumber,
    CR_Type.ACTIVATION,
    workPackage3.project.wbsElement.leadId!,
    workPackage3.project.wbsElement.managerId!,
    new Date('2023-08-21T04:00:00.000Z'),
    true,
    organizationId
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, workPackage3ActivationCrId, 'LGTM!', true, organizationId, null);

  /** Work Package 4 */
  const { workPackageWbsNumber: workPackage4WbsNumber, workPackage: workPackage4 } = await seedWorkPackage(
    thomasEmrax,
    'Install Wiring Harness',
    changeRequestProject5Id,
    WorkPackageStage.Install,
    '04/01/2023',
    7,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Active,
    joeShmoe.userId,
    thomasEmrax.userId,
    organizationId
  );

  const workPackage4ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackage4WbsNumber.carNumber,
    workPackage4WbsNumber.projectNumber,
    workPackage4WbsNumber.workPackageNumber,
    CR_Type.ACTIVATION,
    workPackage4.project.wbsElement.leadId!,
    workPackage4.project.wbsElement.managerId!,
    new Date('2023-10-02T04:00:00.000Z'),
    true,
    organizationId
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, workPackage4ActivationCrId, 'LGTM!', true, organizationId, null);

  /** Work Package 5 */
  const { workPackageWbsNumber: workPackage5WbsNumber, workPackage: workPackage5 } = await seedWorkPackage(
    aang,
    'Design Plush',
    changeRequestProject6Id,
    WorkPackageStage.Design,
    '04/02/2023',
    7,
    [],
    [],
    aang,
    WbsElementStatus.Complete,
    katara.userId,
    aang.userId,
    organizationId
  );

  const workPackage5ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    aang,
    workPackage5WbsNumber.carNumber,
    workPackage5WbsNumber.projectNumber,
    workPackage5WbsNumber.workPackageNumber,
    CR_Type.ACTIVATION,
    workPackage5.project.wbsElement.leadId!,
    workPackage5.project.wbsElement.managerId!,
    new Date('2023-05-08T04:00:00.000Z'),
    true,
    organizationId
  );

  await ChangeRequestsService.reviewChangeRequest(
    joeShmoe,
    workPackage5ActivationCrId,
    'Very cute LGTM!',
    true,
    organizationId,
    null
  );

  /** Work Package 6 */
  const { workPackageWbsNumber: workPackage6WbsNumber, workPackage: workPackage6 } = await seedWorkPackage(
    aang,
    'Put Plush Together',
    changeRequestProject6Id,
    WorkPackageStage.Manufacturing,
    '04/02/2023',
    7,
    [],
    [],
    aang,
    WbsElementStatus.Active,
    katara.userId,
    aang.userId,
    organizationId
  );

  const workPackage6ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    aang,
    workPackage6WbsNumber.carNumber,
    workPackage6WbsNumber.projectNumber,
    workPackage6WbsNumber.workPackageNumber,
    CR_Type.ACTIVATION,
    workPackage6.project.wbsElement.leadId!,
    workPackage6.project.wbsElement.managerId!,
    new Date('2023-07-31T04:00:00.000Z'),
    true,
    organizationId
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, workPackage6ActivationCrId, 'LGTM!', true, organizationId, null);

  /** Work Package 7 */
  const { workPackageWbsNumber: workPackage7WbsNumber, workPackage: workPackage7 } = await seedWorkPackage(
    aang,
    'Plush Testing',
    changeRequestProject6Id,
    WorkPackageStage.Testing,
    '04/02/2023',
    3,
    [],
    [],
    aang,
    WbsElementStatus.Active,
    katara.userId,
    aang.userId,
    organizationId
  );

  const workPackage7ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    aang,
    workPackage7WbsNumber.carNumber,
    workPackage7WbsNumber.projectNumber,
    workPackage7WbsNumber.workPackageNumber,
    CR_Type.ACTIVATION,
    workPackage7.project.wbsElement.leadId!,
    workPackage7.project.wbsElement.managerId!,
    new Date('2023-10-09T04:00:00.000Z'),
    true,
    organizationId
  );

  await ChangeRequestsService.reviewChangeRequest(joeShmoe, workPackage7ActivationCrId, 'LFG', true, organizationId, null);

  /** Work Packages for Project 7 */
  /** Work Package 1 */
  const { workPackage: project3WP1 } = await seedWorkPackage(
    lexLuther,
    'Design Laser Canon',
    changeRequestProject7Id,
    WorkPackageStage.Design,
    '01/01/2023',
    3,
    [],
    [],
    zatanna,
    WbsElementStatus.Active,
    zatanna.userId,
    lexLuther.userId,
    organizationId
  );

  const project3WP1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    lexLuther,
    project3WP1.wbsElement.carNumber,
    project3WP1.wbsElement.projectNumber,
    project3WP1.wbsElement.workPackageNumber,
    CR_Type.ACTIVATION,
    project3WP1.project.wbsElement.leadId!,
    project3WP1.project.wbsElement.managerId!,
    new Date('2024-03-25T04:00:00.000Z'),
    true,
    organizationId
  );

  await ChangeRequestsService.reviewChangeRequest(
    joeShmoe,
    project3WP1ActivationCrId,
    'Approved!',
    true,
    organizationId,
    null
  );

  /** Work Package 2 */
  await seedWorkPackage(
    lexLuther,
    'Laser Canon Research',
    changeRequestProject7Id,
    WorkPackageStage.Research,
    '01/22/2023',
    5,
    [],
    [],
    zatanna,
    WbsElementStatus.Active,
    zatanna.userId,
    lexLuther.userId,
    organizationId
  );

  /** Work Package 3 */
  await seedWorkPackage(
    lexLuther,
    'Laser Canon Testing',
    changeRequestProject7Id,
    WorkPackageStage.Testing,
    '02/15/2023',
    3,
    [],
    [],
    zatanna,
    WbsElementStatus.Active,
    zatanna.userId,
    lexLuther.userId,
    organizationId
  );

  /** Work Packages for Project 8 */
  /** Work Package 1 */
  const { workPackage: project4WP1 } = await seedWorkPackage(
    ryanGiggs,
    'Stadium Research',
    changeRequestProject8Id,
    WorkPackageStage.Research,
    '02/01/2023',
    5,
    [],
    [],
    mikeMacdonald,
    WbsElementStatus.Active,
    mikeMacdonald.userId,
    ryanGiggs.userId,
    organizationId
  );

  const project4WP1ActivationCrId = await ChangeRequestsService.createActivationChangeRequest(
    ryanGiggs,
    project4WP1.wbsElement.carNumber,
    project4WP1.wbsElement.projectNumber,
    project4WP1.wbsElement.workPackageNumber,
    CR_Type.ACTIVATION,
    project4WP1.project.wbsElement.leadId!,
    project4WP1.project.wbsElement.managerId!,
    new Date('2023-08-21T04:00:00.000Z'),
    true,
    organizationId
  );

  await ChangeRequestsService.reviewChangeRequest(
    joeShmoe,
    project4WP1ActivationCrId,
    'Approved!',
    true,
    organizationId,
    null
  );

  /** Work Package 2 */
  await seedWorkPackage(
    ryanGiggs,
    'Stadium Install',
    changeRequestProject8Id,
    WorkPackageStage.Install,
    '03/01/2023',
    8,
    [],
    [],
    mikeMacdonald,
    WbsElementStatus.Active,
    mikeMacdonald.userId,
    ryanGiggs.userId,
    organizationId
  );

  /** Work Package 3 */
  await seedWorkPackage(
    ryanGiggs,
    'Stadium Testing',
    changeRequestProject8Id,
    WorkPackageStage.Testing,
    '06/01/2023',
    3,
    [],
    [],
    mikeMacdonald,
    WbsElementStatus.Active,
    mikeMacdonald.userId,
    ryanGiggs.userId,
    organizationId
  );

  /**
   * Change Requests
   */
  await ChangeRequestsService.createStageGateChangeRequest(
    thomasEmrax,
    workPackage1WbsNumber.carNumber,
    workPackage1WbsNumber.projectNumber,
    workPackage1WbsNumber.workPackageNumber,
    CR_Type.STAGE_GATE,
    true,
    organizationId
  );

  const changeRequest2 = await ChangeRequestsService.createStandardChangeRequest(
    thomasEmrax,
    project2WbsNumber.carNumber,
    project2WbsNumber.projectNumber,
    project2WbsNumber.workPackageNumber,
    CR_Type.DEFINITION_CHANGE,
    'Change the bodywork to be hot pink',
    [
      { type: Scope_CR_Why_Type.DESIGN, explain: 'It would be really pretty' },
      { type: Scope_CR_Why_Type.ESTIMATION, explain: 'I estimate that it would be really pretty' }
    ],
    [
      {
        description: 'Buy hot pink paint',
        scopeImpact: 'n/a',
        timelineImpact: 1,
        budgetImpact: 50
      },
      {
        description: 'Buy slightly cheaper but lower quality hot pink paint',
        scopeImpact: 'n/a',
        timelineImpact: 1,
        budgetImpact: 40
      }
    ],
    organizationId,
    null,
    null
  );
  await ChangeRequestsService.reviewChangeRequest(
    joeShmoe,
    changeRequest2.crId,
    'What the hell Thomas',
    false,
    organizationId,
    null
  );

  await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackage3WbsNumber.carNumber,
    workPackage3WbsNumber.projectNumber,
    workPackage3WbsNumber.workPackageNumber,
    CR_Type.ACTIVATION,
    thomasEmrax.userId,
    joeShmoe.userId,
    new Date('02/01/2023'),
    true,
    organizationId
  );

  /**
   * Tasks
   */
  await TasksService.createTask(
    joeShmoe,
    project1WbsNumber,
    'Research attenuation',
    "I don't know what attenuation is yet",
    new Date('01/01/2024'),
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    joeShmoe,
    project1WbsNumber,
    'Design Attenuator',
    'Autocad?',
    new Date('01/01/2024'),
    Task_Priority.MEDIUM,
    Task_Status.IN_BACKLOG,
    [joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    joeBlow,
    project1WbsNumber,
    'Research Impact',
    'Autocad?',
    new Date('01/01/2024'),
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId, joeBlow.userId],
    organizationId
  );

  await TasksService.createTask(
    joeShmoe,
    project1WbsNumber,
    'Impact Test',
    'Use our conveniently available jumbo watermelon and slingshot to test how well our impact attenuator can ' +
      'attenuate impact.',
    new Date('2024-02-17T00:00:00-05:00'),
    Task_Priority.LOW,
    Task_Status.IN_PROGRESS,
    [joeBlow.userId],
    organizationId
  );

  await TasksService.createTask(
    joeBlow,
    project1WbsNumber,
    'Review Compliance',
    'I think there are some rules we may or may not have overlooked...',
    new Date('2024-01-01T00:00:00-05:00'),
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId],
    organizationId
  );

  await TasksService.createTask(
    thomasEmrax,
    project1WbsNumber,
    'Decorate Impact Attenuator',
    'You know you want to.',
    new Date('2024-01-20T00:00:00-05:00'),
    Task_Priority.LOW,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId, joeBlow.userId, joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    lamarJackson,
    project1WbsNumber,
    'Meet with the Department of Transportation',
    'Discuss design decisions',
    new Date('2023-05-19T00:00:00-04:00'),
    Task_Priority.LOW,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId],
    organizationId
  );

  await TasksService.createTask(
    joeShmoe,
    project1WbsNumber,
    'Build Attenuator',
    'WOOOO',
    new Date('01/01/2024'),
    Task_Priority.LOW,
    Task_Status.DONE,
    [joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    thomasEmrax,
    project1WbsNumber,
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
    new Date('2022-11-16T00:00-05:00'),
    Task_Priority.HIGH,
    Task_Status.DONE,
    [joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    brandonHyde,
    project1WbsNumber,
    'Safety Training',
    'how to use (or not use) the impact attenuator',
    new Date('2023-03-15T00:00:00-04:00'),
    Task_Priority.HIGH,
    Task_Status.DONE,
    [thomasEmrax.userId, joeBlow.userId, joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    thomasEmrax,
    project2WbsNumber,
    'Double-Check Inventory',
    'Nobody really wants to do this...',
    new Date('2023-04-01T00:00:00-04:00'),
    Task_Priority.LOW,
    Task_Status.IN_BACKLOG,
    [],
    organizationId
  );

  await TasksService.createTask(
    thomasEmrax,
    project2WbsNumber,
    'Aerodynamics Test',
    'Wind go wooooosh',
    new Date('2024-01-01T00:00:00-05:00'),
    Task_Priority.MEDIUM,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    johnHarbaugh,
    project2WbsNumber,
    'Ask Sponsors About Logo Sticker Placement',
    'the more sponsors the cooler we look',
    new Date('2024-01-01T00:00:00-05:00'),
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [thomasEmrax.userId, joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    thomasEmrax,
    project2WbsNumber,
    'Discuss Design With Powertrain Team',
    '',
    new Date('2023-10-31T00:00:00-04:00'),
    Task_Priority.MEDIUM,
    Task_Status.DONE,
    [thomasEmrax.userId],
    organizationId
  );

  await TasksService.createTask(
    batman,
    project3WbsNumber,
    'Power the Battery Box',
    'With all our powers combined, we can win any Electric Racing competition!',
    new Date('2024-05-01T00:00:00-04:00'),
    Task_Priority.MEDIUM,
    Task_Status.IN_BACKLOG,
    [thomasEmrax, joeShmoe, joeBlow].map((user) => user.userId),
    organizationId
  );

  await TasksService.createTask(
    thomasEmrax,
    project3WbsNumber,
    'Wire Up Battery Box',
    'Too many wires... how to even keep track?',
    new Date('2024-02-29T00:00:00-05:00'),
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    thomasEmrax,
    project3WbsNumber,
    'Vibration Tests',
    "Battery box shouldn't blow up in the middle of racing...",
    new Date('2024-03-17T00:00:00-05:00'),
    Task_Priority.MEDIUM,
    Task_Status.IN_BACKLOG,
    [joeShmoe.userId],
    organizationId
  );

  await TasksService.createTask(
    joeShmoe,
    project3WbsNumber,
    'Buy some Battery Juice',
    'mmm battery juice',
    new Date('2024-04-15T00:00:00-04:00'),
    Task_Priority.LOW,
    Task_Status.DONE,
    [joeBlow.userId],
    organizationId
  );

  await TasksService.createTask(
    thomasEmrax,
    project4WbsNumber,
    'Schematics',
    'schematics go brrrrr',
    new Date('2024-04-15T00:00:00-04:00'),
    Task_Priority.HIGH,
    Task_Status.DONE,
    [joeBlow.userId],
    organizationId
  );

  await TasksService.createTask(
    regina,
    project5WbsNumber,
    'Cost Assessment',
    'So this is where our funding goes',
    new Date('2023-06-23T00:00:00-04:00'),
    Task_Priority.HIGH,
    Task_Status.IN_PROGRESS,
    [regina.userId],
    organizationId
  );

  /**
   * Reimbursements
   */

  const vendor = await ReimbursementRequestService.createVendor(thomasEmrax, 'Tesla', organizationId);
  await ReimbursementRequestService.createVendor(thomasEmrax, 'Amazon', organizationId);
  await ReimbursementRequestService.createVendor(thomasEmrax, 'Google', organizationId);

  const accountCode = await ReimbursementRequestService.createAccountCode(
    thomasEmrax,
    'Equipment',
    123,
    true,
    [Club_Accounts.CASH, Club_Accounts.BUDGET],
    organizationId
  );

  await ReimbursementRequestService.createReimbursementRequest(
    thomasEmrax,
    new Date(),
    vendor.vendorId,
    ClubAccount.CASH,
    [],
    [
      {
        name: 'GLUE',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 200000
      }
    ],
    accountCode.accountCodeId,
    100,
    organizationId
  );

  await ReimbursementRequestService.createReimbursementRequest(
    thomasEmrax,
    new Date(),
    vendor.vendorId,
    ClubAccount.BUDGET,
    [],
    [
      {
        name: 'BOX',
        reason: {
          carNumber: 0,
          projectNumber: 1,
          workPackageNumber: 0
        },
        cost: 10000
      }
    ],
    accountCode.accountCodeId,
    200,
    organizationId
  );

  /**
   * Bill of Materials
   */
  await BillOfMaterialsService.createManufacturer(thomasEmrax, 'Digikey', organizationId);
  await BillOfMaterialsService.createMaterialType('Resistor', thomasEmrax, organizationId);

  const assembly1 = await BillOfMaterialsService.createAssembly(
    '1',
    thomasEmrax,
    {
      carNumber: 0,
      projectNumber: 1,
      workPackageNumber: 0
    },
    organizationId
  );

  await BillOfMaterialsService.createMaterial(
    thomasEmrax,
    '10k Resistor',
    MaterialStatus.Ordered,
    'Resistor',
    'Digikey',
    'abcdef',
    new Decimal(20),
    30,
    600,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    {
      carNumber: 0,
      projectNumber: 1,
      workPackageNumber: 0
    },
    organizationId,
    'Here are some notes'
  );

  await BillOfMaterialsService.createMaterial(
    thomasEmrax,
    '20k Resistor',
    MaterialStatus.Ordered,
    'Resistor',
    'Digikey',
    'bacfed',
    new Decimal(10),
    7,
    70,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    {
      carNumber: 0,
      projectNumber: 1,
      workPackageNumber: 0
    },
    organizationId,
    'Here are some more notes',
    assembly1.assemblyId
  );

  // Need to do this because the design review cannot be scheduled for a past day
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);

  const designReview1 = await DesignReviewsService.createDesignReview(
    batman,
    nextDay.toDateString(),
    teamType1.teamTypeId,
    [thomasEmrax.userId, batman.userId],
    [superman.userId, wonderwoman.userId],
    {
      carNumber: 0,
      projectNumber: 1,
      workPackageNumber: 0
    },
    [3, 4, 5, 6, 7],
    organizationId
  );

  await DesignReviewsService.editDesignReview(
    batman,
    designReview1.designReviewId,
    nextDay,
    teamType1.teamTypeId,
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
    organizationId
  );

  const newWorkPackageChangeRequest = await ChangeRequestsService.createStandardChangeRequest(
    batman,
    project2WbsNumber.carNumber,
    project2WbsNumber.projectNumber,
    project2WbsNumber.workPackageNumber,
    CR_Type.OTHER,
    'This is a wpchange test',
    [{ type: Scope_CR_Why_Type.OTHER, explain: 'Creating work package' }],
    [],
    organizationId,
    null,
    {
      name: 'new workpackage test',
      leadId: batman.userId,
      managerId: cyborg.userId,
      duration: 5,
      startDate: transformDate(new Date()),
      stage: WorkPackageStage.Design,
      blockedBy: [],
      descriptionBullets: [],
      links: []
    }
  );
  await ChangeRequestsService.reviewChangeRequest(
    joeShmoe,
    newWorkPackageChangeRequest.crId,
    'create wp',
    true,
    organizationId,
    null
  );

  const { workPackageWbsNumber: workPackage9WbsNumber } = await seedWorkPackage(
    thomasEmrax,
    'Slim and Light Car',
    newWorkPackageChangeRequest.crId,
    WorkPackageStage.Design,
    '01/22/2024',
    5,
    [],
    [],
    thomasEmrax,
    WbsElementStatus.Inactive,
    joeShmoe.userId,
    thomasEmrax.userId,
    organizationId
  );

  await ChangeRequestsService.createStandardChangeRequest(
    joeShmoe,
    workPackage9WbsNumber.carNumber,
    workPackage9WbsNumber.projectNumber,
    workPackage9WbsNumber.workPackageNumber,
    CR_Type.OTHER,
    'This is editing a wp through CR',
    [{ type: Scope_CR_Why_Type.OTHER, explain: 'editing a workpackage' }],
    [],
    organizationId,
    null,
    {
      name: 'editing a work package test',
      leadId: batman.userId,
      managerId: cyborg.userId,
      duration: 5,
      startDate: transformDate(new Date()),
      stage: WorkPackageStage.Design,
      blockedBy: [],
      descriptionBullets: [],
      links: []
    }
  );

  await WorkPackageTemplatesService.createWorkPackageTemplate(
    batman,
    'Batmobile Config 1',
    'This is the first Batmobile configuration',
    'Batman Template',
    WorkPackageStage.Install,
    5,
    [],
    [],
    organizationId
  );

  const schematicWpTemplate = await WorkPackageTemplatesService.createWorkPackageTemplate(
    batman,
    'Schematic',
    'This is the schematic template',
    'Schematic Template',
    WorkPackageStage.Design,
    2,
    [],
    [],
    organizationId
  );

  await WorkPackageTemplatesService.createWorkPackageTemplate(
    batman,
    'Layout ',
    'This is the Layout  template',
    'Layout Template',
    WorkPackageStage.Manufacturing,
    4,
    [],
    [schematicWpTemplate.workPackageTemplateId],
    organizationId
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
    }
  ]);

  await RecruitmentServices.createFaq(batman, 'Who is the Chief Software Engineer?', 'Peyton McKee', organizationId);
  await RecruitmentServices.createFaq(
    batman,
    'When was FinishLine created?',
    'FinishLine was created in 2019',
    organizationId
  );
  await RecruitmentServices.createFaq(
    batman,
    'How many developers are working on FinishLine?',
    '178 as of 2024',
    organizationId
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
