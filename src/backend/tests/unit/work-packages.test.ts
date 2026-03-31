import { Organization, User } from '@prisma/client';
import prisma from '../../src/prisma/prisma.js';
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

describe('WorkPackagesService carId filtering', () => {
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
    it('returns work packages matching the requested WBS numbers when carId matches', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);

      const result = await WorkPackagesService.getManyWorkPackages(
        [
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          { carNumber: 1, projectNumber: 1, workPackageNumber: 2 }
        ],
        organization,
        car1.carId
      );

      expect(result).toHaveLength(2);
      const wpNumbers = result.map((wp) => wp.wbsNum.workPackageNumber).sort((a, b) => a - b);
      expect(wpNumbers).toEqual([1, 2]);
    });

    it('silently excludes work packages whose project belongs to a different car when carId is active', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const car2 = await createTestCar(orgId, user.userId, 2);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const proj2 = await createTestProject(user, orgId, undefined, car2.carId, 2, 1);
      await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      await createTestWorkPackage(user, orgId, proj2.projectId, 2, 1, 1);

      const result = await WorkPackagesService.getManyWorkPackages(
        [
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          { carNumber: 2, projectNumber: 1, workPackageNumber: 1 }
        ],
        organization,
        car1.carId
      );

      expect(result).toHaveLength(1);
      expect(result[0].wbsNum).toEqual({ carNumber: 1, projectNumber: 1, workPackageNumber: 1 });
    });

    it('returns all requested work packages when no carId is provided', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const car2 = await createTestCar(orgId, user.userId, 2);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const proj2 = await createTestProject(user, orgId, undefined, car2.carId, 2, 1);
      await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      await createTestWorkPackage(user, orgId, proj2.projectId, 2, 1, 1);

      const result = await WorkPackagesService.getManyWorkPackages(
        [
          { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
          { carNumber: 2, projectNumber: 1, workPackageNumber: 1 }
        ],
        organization
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('getBlockingWorkPackages', () => {
    it('returns blocking work packages belonging to the same car when carId is active', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const wpA = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const wpB = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);

      // wpA blocks wpB
      await prisma.work_Package.update({
        where: { workPackageId: wpB.workPackageId },
        data: { blockedBy: { connect: { wbsElementId: wpA.wbsElement.wbsElementId } } }
      });

      const result = await WorkPackagesService.getBlockingWorkPackages(
        { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
        organization,
        car1.carId
      );

      expect(result).toHaveLength(1);
      expect(result[0].wbsNum).toEqual({ carNumber: 1, projectNumber: 1, workPackageNumber: 2 });
    });

    it('returns all blocking work packages across cars when no carId is provided', async () => {
      const car1 = await createTestCar(orgId, user.userId, 1);
      const car2 = await createTestCar(orgId, user.userId, 2);
      const proj1 = await createTestProject(user, orgId, undefined, car1.carId, 1, 1);
      const proj2 = await createTestProject(user, orgId, undefined, car2.carId, 2, 1);
      const wpA = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 1);
      const wpB = await createTestWorkPackage(user, orgId, proj1.projectId, 1, 1, 2);
      const wpC = await createTestWorkPackage(user, orgId, proj2.projectId, 2, 1, 1);

      // wpA → wpB (car1) and wpA → wpC (car2)
      await prisma.work_Package.update({
        where: { workPackageId: wpB.workPackageId },
        data: { blockedBy: { connect: { wbsElementId: wpA.wbsElement.wbsElementId } } }
      });
      await prisma.work_Package.update({
        where: { workPackageId: wpC.workPackageId },
        data: { blockedBy: { connect: { wbsElementId: wpA.wbsElement.wbsElementId } } }
      });

      const result = await WorkPackagesService.getBlockingWorkPackages(
        { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
        organization
      );

      expect(result).toHaveLength(2);
      const wbsIdentifiers = result.map(
        (wp) => `${wp.wbsNum.carNumber}.${wp.wbsNum.projectNumber}.${wp.wbsNum.workPackageNumber}`
      );
      expect(wbsIdentifiers).toContain('1.1.2');
      expect(wbsIdentifiers).toContain('2.1.1');
    });
  });
});
