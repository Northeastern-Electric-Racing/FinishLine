import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers, createTestCar } from '../test-utils';
import { supermanAdmin, member } from '../test-data/users.test-data';
import CarsService from '../../src/services/car.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import prisma from '../../src/prisma/prisma';

describe('Cars Tests', () => {
  let org: Organization;
  let adminUser: User;
  let nonAdminUser: User;

  beforeEach(async () => {
    org = await createTestOrganization();
    adminUser = await createTestUser(supermanAdmin, org.organizationId);
    nonAdminUser = await createTestUser(member, org.organizationId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('getAllCars', () => {
    test('getAllCars returns empty array when no cars exist', async () => {
      const cars = await CarsService.getAllCars(org);
      expect(cars).toEqual([]);
    });

    test('getAllCars returns all cars for organization', async () => {
      // Create test cars manually with unique car numbers
      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Car 1',
              organizationId: org.organizationId,
              leadId: adminUser.userId,
              managerId: adminUser.userId
            }
          }
        }
      });

      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 1,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Car 2',
              organizationId: org.organizationId,
              leadId: adminUser.userId,
              managerId: adminUser.userId
            }
          }
        }
      });

      const cars = await CarsService.getAllCars(org);
      expect(cars).toHaveLength(2);
    });

    test('getAllCars only returns cars for specified organization', async () => {
      // Create car in our org
      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Our Car',
              organizationId: org.organizationId,
              leadId: adminUser.userId,
              managerId: adminUser.userId
            }
          }
        }
      });

      // Create car in different org
      const uniqueId = `${Date.now()}-${Math.random()}`;
      const orgCreator = await prisma.user.create({
        data: {
          firstName: 'Org',
          lastName: 'Creator',
          email: `org-${uniqueId}@test.com`,
          googleAuthId: `org-${uniqueId}`
        }
      });

      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org',
          description: 'Other organization',
          applicationLink: '',
          userCreatedId: orgCreator.userId
        }
      });

      const otherUser = await createTestUser(
        {
          ...supermanAdmin,
          googleAuthId: `admin-${uniqueId}`,
          email: `admin-${uniqueId}@test.com`,
          emailId: `admin-${uniqueId}`
        },
        otherOrg.organizationId
      );

      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Other Car',
              organizationId: otherOrg.organizationId,
              leadId: otherUser.userId,
              managerId: otherUser.userId
            }
          }
        }
      });

      const cars = await CarsService.getAllCars(org);
      expect(cars).toHaveLength(1);
    });
  });

  describe('getCurrentCar', () => {
    test('getCurrentCar returns null when no cars exist', async () => {
      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar).toBeNull();
    });

    test('getCurrentCar returns the only car when one exists', async () => {
      const testCar = await createTestCar(org.organizationId, adminUser.userId);

      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar).not.toBeNull();
      expect(currentCar!.id).toBe(testCar.carId);
    });

    test('getCurrentCar returns car with highest car number', async () => {
      // Create multiple cars with different car numbers
      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 1,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Car 1',
              organizationId: org.organizationId,
              leadId: adminUser.userId,
              managerId: adminUser.userId
            }
          }
        }
      });

      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 3,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Car 3',
              organizationId: org.organizationId,
              leadId: adminUser.userId,
              managerId: adminUser.userId
            }
          }
        }
      });

      const car2 = await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 2,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Car 2',
              organizationId: org.organizationId,
              leadId: adminUser.userId,
              managerId: adminUser.userId
            }
          }
        }
      });

      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar).not.toBeNull();
      expect(currentCar!.wbsNum.carNumber).toBe(3);
    });

    test('getCurrentCar only considers cars from specified organization', async () => {
      // Create car in our org with car number 1
      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 1,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Our Car',
              organizationId: org.organizationId,
              leadId: adminUser.userId,
              managerId: adminUser.userId
            }
          }
        }
      });

      // Create car in different org with higher car number
      const uniqueId = `${Date.now()}-${Math.random()}`;
      const orgCreator = await prisma.user.create({
        data: {
          firstName: 'Org',
          lastName: 'Creator',
          email: `org-${uniqueId}@test.com`,
          googleAuthId: `org-${uniqueId}`
        }
      });

      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org',
          description: 'Other organization',
          applicationLink: '',
          userCreatedId: orgCreator.userId
        }
      });

      const otherUser = await createTestUser(
        {
          ...supermanAdmin,
          googleAuthId: `admin-${uniqueId}`,
          email: `admin-${uniqueId}@test.com`,
          emailId: `admin-${uniqueId}`
        },
        otherOrg.organizationId
      );

      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 5,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Other Car',
              organizationId: otherOrg.organizationId,
              leadId: otherUser.userId,
              managerId: otherUser.userId
            }
          }
        }
      });

      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar).not.toBeNull();
      expect(currentCar!.wbsNum.carNumber).toBe(1);
      expect(currentCar!.name).toBe('Our Car');
    });
  });

  describe('createCar', () => {
    test('createCar successfully creates car with admin permissions', async () => {
      const carName = 'Test Car';

      const createdCar = await CarsService.createCar(org, adminUser, carName);

      expect(createdCar.name).toBe(carName);
      expect(createdCar.wbsNum.carNumber).toBe(0); // First car should have car number 0
      expect(createdCar.wbsNum.projectNumber).toBe(0);
      expect(createdCar.wbsNum.workPackageNumber).toBe(0);
    });

    test('createCar assigns correct car number based on existing cars', async () => {
      // Create first car
      await CarsService.createCar(org, adminUser, 'Car 1');

      // Create second car
      const secondCar = await CarsService.createCar(org, adminUser, 'Car 2');

      expect(secondCar.wbsNum.carNumber).toBe(1); // Should be incremented
    });

    test('createCar throws AccessDeniedAdminOnlyException for non-admin user', async () => {
      await expect(CarsService.createCar(org, nonAdminUser, 'Test Car')).rejects.toThrow(AccessDeniedAdminOnlyException);
    });

    test('createCar car numbers are organization-specific', async () => {
      // Create car in first org
      const firstCar = await CarsService.createCar(org, adminUser, 'First Org Car');

      // Create different org and admin
      const uniqueId = `${Date.now()}-${Math.random()}`;
      const orgCreator = await prisma.user.create({
        data: {
          firstName: 'Org',
          lastName: 'Creator',
          email: `org2-${uniqueId}@test.com`,
          googleAuthId: `org2-${uniqueId}`
        }
      });

      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Second Org',
          description: 'Second organization',
          applicationLink: '',
          userCreatedId: orgCreator.userId
        }
      });

      const otherAdmin = await createTestUser(
        {
          ...supermanAdmin,
          googleAuthId: `admin2-${uniqueId}`,
          email: `admin2-${uniqueId}@test.com`,
          emailId: `admin2-${uniqueId}`
        },
        otherOrg.organizationId
      );

      // Create car in second org
      const secondCar = await CarsService.createCar(otherOrg, otherAdmin, 'Second Org Car');

      // Both should start from car number 0
      expect(firstCar.wbsNum.carNumber).toBe(0);
      expect(secondCar.wbsNum.carNumber).toBe(0);
    });
  });
});
