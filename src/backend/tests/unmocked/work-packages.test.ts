import { Organization, User } from '@prisma/client';
import prisma from '../../src/prisma/prisma.js';
import { NotFoundException } from '../../src/utils/errors.utils.js';
import {
  createTestCar,
  createTestOrganization,
  createTestProject,
  createTestUser,
  createTestWorkPackage,
  resetUsers
} from '../test-utils.js';
import { supermanAdmin } from '../test-data/users.test-data.js';
import WorkPackagesService from '../../src/services/work-packages.services.js';

describe('Work Package Tests', () => {
  let organization: Organization;
  let orgId: string;
  let user: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(supermanAdmin, orgId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('getManyWorkPackages', () => {
    it('returns all work packages matching the requested WBS numbers', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);

      const result = await WorkPackagesService.getManyWorkPackages(
        [
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          { carNumber: 1, projectNumber: 1, workPackageNumber: 2 }
        ],
        organization
      );

      expect(result).toHaveLength(2);
      const wpNumbers = result.map((wp) => wp.wbsNum.workPackageNumber).sort((a, b) => a - b);
      expect(wpNumbers).toEqual([1, 2]);
    });
  });

  describe('getBlockingWorkPackages', () => {
    it('returns work packages that are blocked by the given work package', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const wpA = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const wpB = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);

      await prisma.work_Package.update({
        where: { workPackageId: wpB.workPackageId },
        data: { blockedBy: { connect: { wbsElementId: wpA.wbsElement.wbsElementId } } }
      });

      const result = await WorkPackagesService.getBlockingWorkPackages(
        { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
        organization
      );

      expect(result).toHaveLength(1);
      expect(result[0].wbsNum).toEqual({ carNumber: 1, projectNumber: 1, workPackageNumber: 2 });
    });
  });

  describe('getWorkPackagesByProject', () => {
    it('successfully returns work packages for a project', async () => {
      const car = await createTestCar(orgId, user.userId);
      const project = await createTestProject(user, orgId, undefined, car.carId);

      await prisma.work_Package.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 1,
              workPackageNumber: 1,
              dateCreated: new Date(),
              name: 'WP 1',
              status: 'INACTIVE',
              leadId: user.userId,
              managerId: user.userId,
              organizationId: orgId
            }
          },
          project: { connect: { projectId: project.projectId } },
          orderInProject: 1,
          startDate: new Date(),
          duration: 2
        }
      });

      const workPackages = await WorkPackagesService.getWorkPackagesByProject(
        { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
        { organizationId: orgId } as any
      );

      expect(workPackages.length).toBe(1);
    });

    it('returns empty array when project has no work packages', async () => {
      const car = await createTestCar(orgId, user.userId);
      await createTestProject(user, orgId, undefined, car.carId);

      const workPackages = await WorkPackagesService.getWorkPackagesByProject(
        { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
        { organizationId: orgId } as any
      );

      expect(workPackages.length).toBe(0);
    });

    it('throws NotFoundException when project does not exist', async () => {
      await expect(async () =>
        WorkPackagesService.getWorkPackagesByProject({ carNumber: 99, projectNumber: 99, workPackageNumber: 0 }, {
          organizationId: orgId
        } as any)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
