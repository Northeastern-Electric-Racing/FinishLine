/* eslint-disable @typescript-eslint/no-unused-vars */

/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  CR_Type,
  PrismaClient,
  Scope_CR_Why_Type,
  Task_Priority,
  Task_Status,
  Team,
  WBS_Element_Status
} from '@prisma/client';
import { dbSeedAllUsers } from './seed-data/users.seed';
import { dbSeedAllSessions } from './seed-data/session.seed';
import { dbSeedAllTeams } from './seed-data/teams.seed';
import ProjectsService from '../services/projects.services';
import ChangeRequestsService from '../services/change-requests.services';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import TeamsService from '../services/teams.services';
import RisksService from '../services/risks.services';
import WorkPackagesService from '../services/work-packages.services';
import { validateWBS, WbsElementStatus } from 'shared';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import { descBulletConverter } from '../utils/utils';
import TasksService from '../services/tasks.services';

const prisma = new PrismaClient();

const performSeed: () => Promise<void> = async () => {
  const thomasEmrax = await prisma.user.create({ data: dbSeedAllUsers.thomasEmrax });
  const joeShmoe = await prisma.user.create({ data: dbSeedAllUsers.joeShmoe });
  const joeBlow = await prisma.user.create({ data: dbSeedAllUsers.joeBlow });
  const wonderwoman = await prisma.user.create({ data: dbSeedAllUsers.wonderwoman });
  const flash = await prisma.user.create({ data: dbSeedAllUsers.flash });
  const aquaman = await prisma.user.create({ data: dbSeedAllUsers.aquaman });
  const robin = await prisma.user.create({ data: dbSeedAllUsers.robin });
  const batman = await prisma.user.create({ data: dbSeedAllUsers.batman });
  const superman = await prisma.user.create({ data: dbSeedAllUsers.superman });
  const hawkMan = await prisma.user.create({ data: dbSeedAllUsers.hawkMan });
  const hawkWoman = await prisma.user.create({ data: dbSeedAllUsers.hawkWoman });
  const cyborg = await prisma.user.create({ data: dbSeedAllUsers.cyborg });
  const greenLantern = await prisma.user.create({ data: dbSeedAllUsers.greenLantern });
  const martianManhunter = await prisma.user.create({ data: dbSeedAllUsers.martianManhunter });
  const nightwing = await prisma.user.create({ data: dbSeedAllUsers.nightwing });
  const brandonHyde = await prisma.user.create({ data: dbSeedAllUsers.brandonHyde });
  const calRipken = await prisma.user.create({ data: dbSeedAllUsers.calRipken });
  const adleyRutschman = await prisma.user.create({ data: dbSeedAllUsers.adleyRutschman });
  const johnHarbaugh = await prisma.user.create({ data: dbSeedAllUsers.johnHarbaugh });
  const lamarJackson = await prisma.user.create({ data: dbSeedAllUsers.lamarJackson });

  for (const seedSession of dbSeedAllSessions) {
    await prisma.session.create({
      data: {
        ...seedSession.fields,
        user: { connect: { userId: seedSession.userId } }
      }
    });
  }

  /**
   * Make initial project so that we can start to create other stuff
   */
  const genesisProject = await prisma.project.create({
    data: {
      wbsElement: {
        create: {
          carNumber: 0,
          projectNumber: 0,
          workPackageNumber: 0,
          dateCreated: new Date('01/01/2023'),
          name: 'Genesis',
          status: WBS_Element_Status.INACTIVE,
          projectLeadId: batman.userId,
          projectManagerId: cyborg.userId
        }
      },
      summary: 'Initial Car so that we can make change requests and projects and other stuff',
      budget: 1000,
      rules: []
    },
    ...projectQueryArgs
  });

  /**
   * Make an initial change request for car 1 using the wbs of the genesis project
   */
  const changeRequest1Id: number = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    genesisProject.wbsElement.carNumber,
    genesisProject.wbsElement.projectNumber,
    genesisProject.wbsElement.workPackageNumber,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need this to initialize all the seed data'
      }
    ]
  );

  // make a proposed solution for it
  const proposedSolution1Id: string = await ChangeRequestsService.addProposedSolution(
    cyborg,
    changeRequest1Id,
    0,
    'Initializing seed data',
    0,
    'no scope impact'
  );

  // approve the change request
  await ChangeRequestsService.reviewChangeRequest(batman, changeRequest1Id, 'LGTM', true, proposedSolution1Id);

  /**
   * TEAMS
   */
  const justiceLeague: Team = await prisma.team.create(dbSeedAllTeams.justiceLeague(batman.userId));
  const ravens: Team = await prisma.team.create(dbSeedAllTeams.ravens(johnHarbaugh.userId));
  const orioles: Team = await prisma.team.create(dbSeedAllTeams.orioles(brandonHyde.userId));
  const huskies: Team = await prisma.team.create(dbSeedAllTeams.huskies(thomasEmrax.userId));

  await TeamsService.setTeamMembers(
    batman,
    justiceLeague.teamId,
    [wonderwoman, flash, aquaman, superman, hawkMan, hawkWoman, cyborg, greenLantern, martianManhunter].map(
      (user) => user.userId
    )
  );
  await TeamsService.setTeamMembers(johnHarbaugh, ravens.teamId, [lamarJackson.userId]);
  await TeamsService.setTeamMembers(brandonHyde, orioles.teamId, [adleyRutschman.userId, calRipken.userId]);
  await TeamsService.setTeamMembers(thomasEmrax, huskies.teamId, [joeShmoe.userId, joeBlow.userId]);

  /**
   * PROJECTS
   */
  const project1WbsNumber = await ProjectsService.createProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Impact Attenuator',
    'Develop rules-compliant impact attenuator',
    huskies.teamId
  );

  const project1 = await prisma.project.findFirstOrThrow({
    where: {
      wbsElement: {
        carNumber: project1WbsNumber.carNumber,
        projectNumber: project1WbsNumber.projectNumber,
        workPackageNumber: project1WbsNumber.workPackageNumber
      }
    },
    ...projectQueryArgs
  });
  await ProjectsService.editProject(
    joeShmoe,
    project1.projectId,
    changeRequest1Id,
    project1.wbsElement.name,
    project1.budget,
    project1.summary,
    ['EV3.5.2'],
    [{ id: -1, detail: 'Decrease size by 90% from 247 cubic inches to 24.7 cubic inches' }],
    [
      {
        id: -1,
        detail: 'Capable of absorbing 5000N in a head-on collision'
      }
    ],
    [
      {
        id: -1,
        detail: 'Cannot go further towards the rear of the car than the front roll hoop'
      }
    ],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    thomasEmrax.userId,
    joeBlow.userId
  );

  await RisksService.createRisk(thomasEmrax, project1.projectId, 'This one could get too expensive');
  await RisksService.createRisk(joeShmoe, project1.projectId, 'This Imact could Attenuate too much!');
  const risk3Id = await RisksService.createRisk(thomasEmrax, project1.projectId, 'At risk of nuclear explosion');
  const risk3 = await prisma.risk.findUniqueOrThrow({ where: { id: risk3Id } });
  await RisksService.editRisk(thomasEmrax, risk3Id, risk3.detail, true);

  const project2WbsNumber = await ProjectsService.createProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Bodywork',
    'Develop rules-compliant bodywork',
    huskies.teamId
  );
  const project2 = await prisma.project.findFirstOrThrow({
    where: {
      wbsElement: {
        carNumber: project2WbsNumber.carNumber,
        projectNumber: project2WbsNumber.projectNumber,
        workPackageNumber: project2WbsNumber.workPackageNumber
      }
    },
    ...projectQueryArgs
  });
  await ProjectsService.editProject(
    thomasEmrax,
    project2.projectId,
    changeRequest1Id,
    project2.wbsElement.name,
    50,
    project2.summary,
    ['T12.3.2', 'T8.2.6'],
    [{ id: -1, detail: 'Decrease weight by 90% from 4.8 pounds to 0.48 pounds' }],
    [{ id: -1, detail: 'Provides removable section for easy access to the pedal box' }],
    [{ id: -1, detail: 'Compatible with a side-pod chassis design' }],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    joeShmoe.userId,
    thomasEmrax.userId
  );

  const project3WbsNumber = await ProjectsService.createProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Battery Box',
    'Develop rules-compliant battery box.',
    huskies.teamId
  );
  const project3 = await prisma.project.findFirstOrThrow({
    where: {
      wbsElement: {
        carNumber: project3WbsNumber.carNumber,
        projectNumber: project3WbsNumber.projectNumber,
        workPackageNumber: project3WbsNumber.workPackageNumber
      }
    },
    ...projectQueryArgs
  });
  await ProjectsService.editProject(
    thomasEmrax,
    project3.projectId,
    changeRequest1Id,
    project3.wbsElement.name,
    5000,
    project3.summary,
    ['EV3.5.2', 'EV1.4.7', 'EV6.3.10'],
    [{ id: -1, detail: 'Decrease weight by 60% from 100 pounds to 40 pounds' }],
    [{ id: -1, detail: 'Provides 50,000 Wh of energy discharge' }],
    [{ id: -1, detail: 'Maximum power consumption of 25 watts from the low voltage system' }],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    joeShmoe.userId,
    thomasEmrax.userId
  );

  const project4WbsNumber = await ProjectsService.createProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Motor Controller Integration',
    'Develop rules-compliant motor controller integration.',
    huskies.teamId
  );
  const project4 = await prisma.project.findFirstOrThrow({
    where: {
      wbsElement: {
        carNumber: project4WbsNumber.carNumber,
        projectNumber: project4WbsNumber.projectNumber,
        workPackageNumber: project4WbsNumber.workPackageNumber
      }
    },
    ...projectQueryArgs
  });
  await ProjectsService.editProject(
    thomasEmrax,
    project4.projectId,
    changeRequest1Id,
    project4.wbsElement.name,
    0,
    project4.summary,
    [],
    [{ id: -1, detail: 'Power consumption stays under 10 watts from the low voltage system' }],
    [{ id: -1, detail: 'Capable of interfacing via I2C or comparable serial interface.' }],
    [
      { id: -1, detail: 'Must be compatible with chain drive' },
      { id: -1, detail: 'Must be well designed and whatnot' }
    ],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    joeShmoe.userId,
    joeBlow.userId
  );

  const project5WbsNumber = await ProjectsService.createProject(
    thomasEmrax,
    changeRequest1Id,
    1,
    'Wiring Harness',
    'Develop rules-compliant wiring harness.',
    huskies.teamId
  );
  const project5 = await prisma.project.findFirstOrThrow({
    where: {
      wbsElement: {
        carNumber: project5WbsNumber.carNumber,
        projectNumber: project5WbsNumber.projectNumber,
        workPackageNumber: project5WbsNumber.workPackageNumber
      }
    },
    ...projectQueryArgs
  });
  await ProjectsService.editProject(
    thomasEmrax,
    project5.projectId,
    changeRequest1Id,
    project5.wbsElement.name,
    234,
    project5.summary,
    ['EV3.5.2', 'T12.3.2', 'T8.2.6', 'EV1.4.7', 'EV6.3.10'],
    [{ id: -1, detail: 'Decrease installed component costs by 63% from $2,700 to $1000' }],
    [
      { id: -1, detail: 'All wires are bundled and secured to the chassis at least every 6 inches' },
      { id: -1, detail: 'Wires are not wireless' }
    ],
    [{ id: -1, detail: 'Utilizes 8020 frame construction' }],
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    thomasEmrax.userId,
    joeBlow.userId
  );

  /**
   * Work Packages
   */
  const workPackage1WbsString = await WorkPackagesService.createWorkPackage(
    joeShmoe,
    project1WbsNumber,
    'Bodywork Concept of Design',
    changeRequest1Id,
    '01/01/2023',
    3,
    [],
    [
      'Assess the bodywork captsone and determine what can be learned from their deliverables',
      'Compare various material, design, segmentation, and mounting choices available and propose the best combination'
    ],
    ['High-level anaylsis of options and direction to go in for the project']
  );
  const workPackage1WbsNumber = validateWBS(workPackage1WbsString);
  const workPackage1 = await prisma.work_Package.findFirstOrThrow({
    where: {
      wbsElement: {
        carNumber: workPackage1WbsNumber.carNumber,
        projectNumber: workPackage1WbsNumber.projectNumber,
        workPackageNumber: workPackage1WbsNumber.workPackageNumber
      }
    },
    ...workPackageQueryArgs
  });
  await WorkPackagesService.editWorkPackage(
    thomasEmrax,
    workPackage1.workPackageId,
    workPackage1.wbsElement.name,
    changeRequest1Id,
    workPackage1.startDate.toString(),
    workPackage1.duration,
    workPackage1.dependencies,
    workPackage1.expectedActivities.map(descBulletConverter),
    workPackage1.deliverables.map(descBulletConverter),
    WbsElementStatus.Active,
    thomasEmrax.userId,
    thomasEmrax.userId
  );

  const workPackage2WbsString = await WorkPackagesService.createWorkPackage(
    thomasEmrax,
    project1WbsNumber,
    'Adhesive Shear Strength Test',
    changeRequest1Id,
    '01/22/2023',
    5,
    [],
    [
      'Build a test procedure for destructively measuring the shear strength of various adhesives interacting with foam and steel plates',
      'Design and manufacture test fixtures to perform destructive testing',
      'Write a report to summarize findings'
    ],
    [
      'Lab report with full data on the shear strength of adhesives under test including a summary and conclusion of which adhesive is best'
    ]
  );
  const workPackage2WbsNumber = validateWBS(workPackage2WbsString);
  const workPackage2 = await prisma.work_Package.findFirstOrThrow({
    where: {
      wbsElement: {
        carNumber: workPackage2WbsNumber.carNumber,
        projectNumber: workPackage2WbsNumber.projectNumber,
        workPackageNumber: workPackage2WbsNumber.workPackageNumber
      }
    },
    ...workPackageQueryArgs
  });
  await WorkPackagesService.editWorkPackage(
    thomasEmrax,
    workPackage2.workPackageId,
    workPackage2.wbsElement.name,
    changeRequest1Id,
    workPackage2.startDate.toString(),
    workPackage2.duration,
    workPackage2.dependencies,
    workPackage2.expectedActivities.map(descBulletConverter),
    workPackage2.deliverables.map(descBulletConverter),
    WbsElementStatus.Inactive,
    joeShmoe.userId,
    thomasEmrax.userId
  );

  const workPackage3WbsString = await WorkPackagesService.createWorkPackage(
    thomasEmrax,
    project5WbsNumber,
    'Manufacture Wiring Harness',
    changeRequest1Id,
    '02/01/2023',
    3,
    [],
    [
      'Manufacutre section A of the wiring harness',
      'Determine which portion of the wiring harness is important',
      'Solder wiring segments together and heat shrink properly',
      'Cut all wires to length'
    ],
    ['Completed wiring harness for the entire car']
  );
  const workPackage3WbsNumber = validateWBS(workPackage3WbsString);

  /**
   * Change Requests
   */
  await ChangeRequestsService.createStageGateChangeRequest(
    thomasEmrax,
    workPackage1WbsNumber.carNumber,
    workPackage1WbsNumber.projectNumber,
    workPackage1WbsNumber.workPackageNumber,
    CR_Type.STAGE_GATE,
    0,
    true
  );

  const changeRequest2Id = await ChangeRequestsService.createStandardChangeRequest(
    thomasEmrax,
    project2WbsNumber.carNumber,
    project2WbsNumber.projectNumber,
    project2WbsNumber.workPackageNumber,
    CR_Type.DEFINITION_CHANGE,
    'Change the bodywork to be hot pink',
    [
      { type: Scope_CR_Why_Type.DESIGN, explain: 'It would be really pretty' },
      { type: Scope_CR_Why_Type.ESTIMATION, explain: 'I estimate that it would be really pretty' }
    ]
  );
  await ChangeRequestsService.addProposedSolution(thomasEmrax, changeRequest2Id, 50, 'Buy hot pink paint', 1, 'n/a');
  await ChangeRequestsService.addProposedSolution(
    thomasEmrax,
    changeRequest2Id,
    40,
    'Buy slightly cheaper but lower quality hot pink paint',
    1,
    'n/a'
  );
  await ChangeRequestsService.reviewChangeRequest(joeShmoe, changeRequest2Id, 'What the hell Thomas', false, null);

  await ChangeRequestsService.createActivationChangeRequest(
    thomasEmrax,
    workPackage3WbsNumber.carNumber,
    workPackage3WbsNumber.projectNumber,
    workPackage3WbsNumber.workPackageNumber,
    CR_Type.ACTIVATION,
    thomasEmrax.userId,
    joeShmoe.userId,
    new Date('02/01/2023'),
    true
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
    [joeShmoe.userId]
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
