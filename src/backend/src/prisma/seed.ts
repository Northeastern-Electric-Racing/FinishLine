/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { PrismaClient } from '@prisma/client';
import { dbSeedAllUsers } from './seed-data/users';
import { dbSeedAllProjects } from './seed-data/projects';
import { dbSeedAllWorkPackages } from './seed-data/work-packages';
import { dbSeedAllChangeRequests } from './seed-data/change-requests';
import { dbSeedAllSessions } from './seed-data/session';
import { dbSeedAllRisks } from './seed-data/risks';

const prisma = new PrismaClient();

const performSeed: () => Promise<void> = async () => {
  for (const seedUser of dbSeedAllUsers) {
    await prisma.user.create({ data: { ...seedUser, userSettings: { create: {} } } });
  }

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
};

performSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
