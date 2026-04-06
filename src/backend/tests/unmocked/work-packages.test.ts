import { supermanAdmin } from '../test-data/users.test-data.js';
import { NotFoundException } from '../../src/utils/errors.utils.js';
import { createTestOrganization, createTestProject, createTestCar, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import WorkPackagesService from '../../src/services/work-packages.services.js';

describe('Work Package Tests', () => {
  let organizationId: string;

  beforeEach(async () => {
    ({ organizationId } = await createTestOrganization());
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get work packages by project wbs num', () => {
    test('Successfully returns work packages for a project', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId);
      const project = await createTestProject(user, organizationId, undefined, car.carId);

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
              organizationId
            }
          },
          project: { connect: { projectId: project.projectId } },
          orderInProject: 1,
          startDate: new Date(),
          duration: 2
        }
      });

      const workPackages = await WorkPackagesService.getWorkPackagesByProjectWbsNum(
        { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
        { organizationId } as any
      );

      expect(workPackages.length).toBe(1);
    });

    test('Returns empty array when project has no work packages', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId);
      await createTestProject(user, organizationId, undefined, car.carId);

      const workPackages = await WorkPackagesService.getWorkPackagesByProjectWbsNum(
        { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
        { organizationId } as any
      );

      expect(workPackages.length).toBe(0);
    });

    test('Throws NotFoundException when project does not exist', async () => {
      await expect(async () =>
        WorkPackagesService.getWorkPackagesByProjectWbsNum({ carNumber: 99, projectNumber: 99, workPackageNumber: 0 }, {
          organizationId
        } as any)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
