import {
  createTestCar,
  createTestOrganization,
  createTestProject,
  createTestUser,
  createTestWorkPackage,
  resetUsers
} from '../test-utils';
import { supermanAdmin } from '../test-data/users.test-data';
import prisma from '../../src/prisma/prisma';
import { Organization, User, WBS_Element_Status } from '@prisma/client';

describe('Change Request Tests', () => {
  let orgId: string;
  let organization: Organization;
  let user: User;
  let wpWbsElementId: string;
  let workPackageId: string;
  let startDate: Date;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);
    await prisma.wBS_Element.create({
      data: {
        carNumber: 12,
        projectNumber: 13,
        workPackageNumber: 14,
        name: 'test wbs',
        organizationId: orgId,
        status: WBS_Element_Status.INACTIVE
      }
    });
    const car = await createTestCar(orgId, user.userId, 2);
    const project = await createTestProject(user, orgId, undefined, car.carId, 2, 1);
    const wp = await createTestWorkPackage(user, orgId, project.projectId, 2, 1, 1);

    wpWbsElementId = wp.wbsElement.wbsElementId;
    ({ workPackageId, startDate } = wp);
  });

  afterEach(async () => {
    await resetUsers();
  });
});
