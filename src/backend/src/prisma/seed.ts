/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { CR_Type, PrismaClient, Scope_CR_Why_Type, Team, WBS_Element_Status } from '@prisma/client';
import { dbSeedAllUsers } from './seed-data/users.seed';
import { dbSeedAllProjects } from './seed-data/projects.seed';
import { dbSeedAllWorkPackages } from './seed-data/work-packages.seed';
import { dbSeedAllChangeRequests } from './seed-data/change-requests.seed';
import { dbSeedAllSessions } from './seed-data/session.seed';
import { dbSeedAllRisks } from './seed-data/risks.seed';
import { dbSeedAllTeams } from './seed-data/teams.seed';
import { dbSeedAllProposedSolutions } from './seed-data/proposed-solutions.seed';
import ProjectsService from '../services/projects.services';
import ChangeRequestsService from '../services/change-requests.services';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import TeamsService from '../services/teams.services';
import RisksService from '../services/risks.services';

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
  const calRipken = await prisma.user.create({ data: dbSeedAllUsers.calRipken });
  const adleyRutschman = await prisma.user.create({ data: dbSeedAllUsers.adleyRutschman });
  const johnHarbaugh = await prisma.user.create({ data: dbSeedAllUsers.calRipken });
  const lamarJackson = await prisma.user.create({ data: dbSeedAllUsers.adleyRutschman });

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
   * Make an initial change request using the wbs of the genesis project
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
        scopeCrWhyId: -1,
        scopeCrId: -1,
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
  const orioles: Team = await prisma.team.create(dbSeedAllTeams.orioles(calRipken.userId));
  const huskies: Team = await prisma.team.create(dbSeedAllTeams.huskies(thomasEmrax.userId));

  await TeamsService.setTeamMembers(
    batman,
    justiceLeague.teamId,
    [wonderwoman, flash, aquaman, superman, hawkMan, hawkWoman, cyborg, greenLantern, martianManhunter].map(
      (user) => user.userId
    )
  );
  await TeamsService.setTeamMembers(johnHarbaugh, ravens.teamId, [lamarJackson.userId]);
  await TeamsService.setTeamMembers(calRipken, orioles.teamId, [adleyRutschman.userId]);
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

  for (const seedWorkPackage of dbSeedAllWorkPackages) {
    await prisma.work_Package.create({
      data: {
        wbsElement: { create: { ...seedWorkPackage.wbsElementFields } },
        project: { connect: { projectId: seedWorkPackage.projectId } },
        ...seedWorkPackage.workPackageFields,
        expectedActivities: { create: seedWorkPackage.expectedActivities },
        deliverables: { create: seedWorkPackage.deliverables }
      }
    });
  }

  for (const seedChangeRequest of dbSeedAllChangeRequests) {
    const data: any = {
      submitter: { connect: { userId: seedChangeRequest.submitterId } },
      wbsElement: { connect: { wbsElementId: seedChangeRequest.wbsElementId } },
      ...seedChangeRequest.changeRequestFields,
      changes: { create: seedChangeRequest.changes }
    };
    if (seedChangeRequest.scopeChangeRequestFields) {
      data.scopeChangeRequest = {
        create: {
          ...seedChangeRequest.scopeChangeRequestFields.otherFields,
          why: { create: seedChangeRequest.scopeChangeRequestFields.why }
        }
      };
    }
    if (seedChangeRequest.activationChangeRequestFields) {
      data.activationChangeRequest = {
        create: {
          ...seedChangeRequest.activationChangeRequestFields.otherFields,
          projectLead: {
            connect: { userId: seedChangeRequest.activationChangeRequestFields.projectLeadId }
          },
          projectManager: {
            connect: { userId: seedChangeRequest.activationChangeRequestFields.projectManagerId }
          }
        }
      };
    }
    if (seedChangeRequest.stageGateChangeRequestFields) {
      data.stageGateChangeRequest = {
        create: { ...seedChangeRequest.stageGateChangeRequestFields }
      };
    }
    await prisma.change_Request.create({ data });
  }

  for (const seedProposedSolution of dbSeedAllProposedSolutions) {
    await prisma.proposed_Solution.create({
      data: {
        description: seedProposedSolution.description,
        timelineImpact: seedProposedSolution.timelineImpact,
        scopeImpact: seedProposedSolution.scopeImpact,
        budgetImpact: seedProposedSolution.budgetImpact,
        changeRequestId: seedProposedSolution.changeRequestId,
        createdByUserId: seedProposedSolution.createdByUserId,
        dateCreated: seedProposedSolution.dateCreated,
        approved: seedProposedSolution.approved
      }
    });
  }
};

performSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
