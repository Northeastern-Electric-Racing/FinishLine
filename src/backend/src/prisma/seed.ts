/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { CR_Type, PrismaClient, Scope_CR_Why_Type } from '@prisma/client';
import { dbSeedAllUsers } from './seed-data/users.seed';
import { dbSeedAllProjects } from './seed-data/projects.seed';
import { dbSeedAllWorkPackages } from './seed-data/work-packages.seed';
import { dbSeedAllChangeRequests } from './seed-data/change-requests.seed';
import { dbSeedAllSessions } from './seed-data/session.seed';
import { dbSeedAllRisks } from './seed-data/risks.seed';
import { dbSeedAllTeams } from './seed-data/teams.seed';
import { dbSeedAllProposedSolutions } from './seed-data/proposed-solutions.seed';
import ProjectsService from '../services/projects.services';
import ChangeRequestsService from '../services/change-request.services';

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

  for (const seedSession of dbSeedAllSessions) {
    await prisma.session.create({
      data: {
        ...seedSession.fields,
        user: { connect: { userId: seedSession.userId } }
      }
    });
  }

  for (const seedProject of dbSeedAllProjects) {
    await prisma.project.create({
      data: {
        wbsElement: { create: { ...seedProject.wbsElementFields } },
        ...seedProject.projectFields,
        goals: { create: seedProject.goals },
        features: { create: seedProject.features },
        otherConstraints: { create: seedProject.otherConstraints }
      }
    });
  }

  const changeRequest1Id: number = await ChangeRequestsService.createStandardChangeRequest(
    cyborg,
    0,
    0,
    0,
    CR_Type.OTHER,
    'Initial Change Request',
    [
      {
        scopeCrWhyId: -1,
        scopeCrId: -1,
        type: Scope_CR_Why_Type.INITIALIZATION,
        explain: 'need to initialize all this seed data'
      }
    ],
    0
  );

  const project1 = await ProjectsService.createProject(batman, changeRequest1Id);

  for (const seedTeam of dbSeedAllTeams) {
    await prisma.team.create({
      data: {
        ...seedTeam.fields,
        leaderId: seedTeam.leaderId,
        projects: { connect: seedTeam.projectIds },
        members: { connect: seedTeam.memberIds }
      }
    });
  }

  for (const seedRisk of dbSeedAllRisks) {
    await prisma.risk.create({
      data: {
        createdBy: { connect: { userId: seedRisk.createdByUserId } },
        project: { connect: { projectId: seedRisk.projectId } },
        ...seedRisk.fields
      }
    });
  }

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
