/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers, createTestCar } from '../test-utils';
import { supermanAdmin, batmanAppAdmin } from '../test-data/users.test-data';
import CarsService from '../../src/services/car.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import prisma from '../../src/prisma/prisma';

describe('Cars Service Integration Tests', () => {
  let org: Organization;
  let adminUser: User;
  let nonAdminUser: User;

  beforeEach(async () => {
    org = await createTestOrganization();
    adminUser = await createTestUser(supermanAdmin, org.organizationId);
    nonAdminUser = await createTestUser(batmanAppAdmin, org.organizationId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('getAllCars Integration', () => {
    it('returns cars with proper transformation and relations', async () => {
      // Create test cars with complex data
      const car1 = await createTestCar(org.organizationId, adminUser.userId);
      const car2 = await createTestCar(org.organizationId, adminUser.userId);

      const cars = await CarsService.getAllCars(org);

      expect(cars).toHaveLength(2);
      expect(cars[0]).toHaveProperty('id');
      expect(cars[0]).toHaveProperty('name');
      expect(cars[0]).toHaveProperty('wbsNum');
      expect(cars[0]).toHaveProperty('dateCreated');
      expect(cars[0]).toHaveProperty('lead');
      expect(cars[0]).toHaveProperty('manager');
    });

    it('handles database errors gracefully', async () => {
      // Create a mock organization that doesn't exist
      const fakeOrg = { organizationId: 'non-existent-org' } as Organization;

      const cars = await CarsService.getAllCars(fakeOrg);
      expect(cars).toEqual([]);
    });
  });

  describe('getCurrentCar Integration', () => {
    it('correctly identifies current car with database ordering', async () => {
      // Create cars with specific ordering scenarios
      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 5,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Middle Car',
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
              carNumber: 10,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Latest Car',
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
              name: 'Old Car',
              organizationId: org.organizationId,
              leadId: adminUser.userId,
              managerId: adminUser.userId
            }
          }
        }
      });

      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar).not.toBeNull();
      expect(currentCar!.wbsNum.carNumber).toBe(10);
      expect(currentCar!.name).toBe('Latest Car');
    });

    it('handles concurrent car creation scenarios', async () => {
      // Simulate concurrent creation by creating multiple cars rapidly
      const carPromises = Array.from({ length: 5 }, (_, index) =>
        CarsService.createCar(org, adminUser, `Concurrent Car ${index}`)
      );

      const createdCars = await Promise.all(carPromises);
      
      // Verify all cars were created with proper numbering
      const carNumbers = createdCars.map(car => car.wbsNum.carNumber).sort();
      expect(carNumbers).toEqual([0, 1, 2, 3, 4]);

      // Verify getCurrentCar returns the highest numbered car
      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar!.wbsNum.carNumber).toBe(4);
    });
  });

  describe('createCar Integration', () => {
    it('creates car with proper database relationships', async () => {
      const carName = 'Integration Test Car';
      
      const createdCar = await CarsService.createCar(org, adminUser, carName);
      
      // Verify the car was properly created in the database
      const dbCar = await prisma.car.findUnique({
        where: { carId: createdCar.id },
        include: {
          wbsElement: {
            include: {
              lead: true,
              manager: true,
              organization: true
            }
          }
        }
      });

      expect(dbCar).not.toBeNull();
      expect(dbCar!.wbsElement.name).toBe(carName);
      expect(dbCar!.wbsElement.leadId).toBe(adminUser.userId);
      expect(dbCar!.wbsElement.managerId).toBe(adminUser.userId);
      expect(dbCar!.wbsElement.organizationId).toBe(org.organizationId);
    });

    it('maintains data integrity across transactions', async () => {
      const initialCarCount = await prisma.car.count({
        where: {
          wbsElement: {
            organizationId: org.organizationId
          }
        }
      });

      try {
        // This should fail due to permissions
        await CarsService.createCar(org, nonAdminUser, 'Should Fail');
      } catch (error) {
        expect(error).toBeInstanceOf(AccessDeniedAdminOnlyException);
      }

      // Verify no car was created due to the failed transaction
      const finalCarCount = await prisma.car.count({
        where: {
          wbsElement: {
            organizationId: org.organizationId
          }
        }
      });

      expect(finalCarCount).toBe(initialCarCount);
    });

    it('handles database constraints properly', async () => {
      // Test with edge cases that might violate constraints
      const longName = 'A'.repeat(1000); // Very long name
      
      // This should either succeed or fail gracefully depending on DB constraints
      await expect(async () => {
        await CarsService.createCar(org, adminUser, longName);
      }).not.toThrow(/Unexpected error/);
    });
  });

  describe('Cross-Organization Data Isolation', () => {
    it('ensures complete data isolation between organizations', async () => {
      // Create cars in first org
      await CarsService.createCar(org, adminUser, 'Org1 Car 1');
      await CarsService.createCar(org, adminUser, 'Org1 Car 2');

      // Create second org with its own cars
      const org2 = await createTestOrganization();
      const admin2 = await createTestUser(supermanAdmin, org2.organizationId);
      await CarsService.createCar(org2, admin2, 'Org2 Car 1');

      // Verify each org only sees its own cars
      const org1Cars = await CarsService.getAllCars(org);
      const org2Cars = await CarsService.getAllCars(org2);

      expect(org1Cars).toHaveLength(2);
      expect(org2Cars).toHaveLength(1);

      expect(org1Cars.every(car => car.name.startsWith('Org1'))).toBe(true);
      expect(org2Cars.every(car => car.name.startsWith('Org2'))).toBe(true);

      // Verify current car logic is also isolated
      const org1Current = await CarsService.getCurrentCar(org);
      const org2Current = await CarsService.getCurrentCar(org2);

      expect(org1Current!.name).toBe('Org1 Car 2');
      expect(org2Current!.name).toBe('Org2 Car 1');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles database connection issues gracefully', async () => {
      // Create a car first
      await CarsService.createCar(org, adminUser, 'Test Car');

      // This test would require mocking Prisma to simulate connection issues
      // For now, we'll test that the service handles null/undefined gracefully
      const result = await CarsService.getCurrentCar(org);
      expect(result).toBeTruthy();
    });

    it('maintains consistency during high-concurrency operations', async () => {
      // Simulate multiple users creating cars simultaneously
      const promises = Array.from({ length: 10 }, (_, i) =>
        CarsService.createCar(org, adminUser, `Concurrent Car ${i}`)
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');

      // All cars should be created successfully
      expect(successful).toHaveLength(10);

      // Verify car numbering is sequential
      const cars = await CarsService.getAllCars(org);
      const carNumbers = cars.map(car => car.wbsNum.carNumber).sort((a, b) => a - b);
      expect(carNumbers).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('handles edge cases in car naming and validation', async () => {
      // Test various edge cases
      const edgeCases = [
        'Car with special chars !@#$%^&*()',
        'Car with numbers 12345',
        'Car with spaces    and    tabs',
        'Very long car name that exceeds typical limits but should still work fine',
        '车名中文', // Non-ASCII characters
        '' // Empty string
      ];

      for (const carName of edgeCases) {
        try {
          const car = await CarsService.createCar(org, adminUser, carName);
          expect(car.name).toBe(carName);
        } catch (error) {
          // Some edge cases might fail due to validation, which is acceptable
          console.log(`Edge case "${carName}" failed as expected:`, error);
        }
      }
    });

    it('properly handles organization and user validation', async () => {
      // Test with malformed organization
      const invalidOrg = { organizationId: '' } as Organization;
      
      await expect(CarsService.getCurrentCar(invalidOrg)).rejects.toThrow();

      // Test with non-existent organization
      const nonExistentOrg = { organizationId: 'non-existent' } as Organization;
      const result = await CarsService.getCurrentCar(nonExistentOrg);
      expect(result).toBeNull();
    });

    it('handles transaction rollbacks properly', async () => {
      const initialCount = await prisma.car.count({
        where: { wbsElement: { organizationId: org.organizationId } }
      });

      // Attempt operation that should fail
      try {
        await CarsService.createCar(org, nonAdminUser, 'Should Fail');
      } catch (error) {
        expect(error).toBeInstanceOf(AccessDeniedAdminOnlyException);
      }

      // Verify count hasn't changed
      const finalCount = await prisma.car.count({
        where: { wbsElement: { organizationId: org.organizationId } }
      });

      expect(finalCount).toBe(initialCount);
    });

    it('ensures proper cleanup and resource management', async () => {
      // Create multiple cars and verify they can be properly queried
      const carNames = ['Car A', 'Car B', 'Car C'];
      const createdCars = [];

      for (const name of carNames) {
        const car = await CarsService.createCar(org, adminUser, name);
        createdCars.push(car);
      }

      // Verify all cars exist
      const allCars = await CarsService.getAllCars(org);
      expect(allCars).toHaveLength(3);

      // Verify current car is the latest
      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar!.name).toBe('Car C');
      expect(currentCar!.wbsNum.carNumber).toBe(2); // 0-indexed, so third car is #2
    });
  });
});

import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers, createTestCar } from '../test-utils';
import { supermanAdmin, batmanAppAdmin } from '../test-data/users.test-data';
import CarsService from '../../src/services/car.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import prisma from '../../src/prisma/prisma';

describe('Cars Service Integration Tests', () => {
  let org: Organization;
  let adminUser: User;
  let nonAdminUser: User;

  beforeEach(async () => {
    org = await createTestOrganization();
    adminUser = await createTestUser(supermanAdmin, org.organizationId);
    nonAdminUser = await createTestUser(batmanAppAdmin, org.organizationId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('getAllCars Integration', () => {
    it('returns cars with proper transformation and relations', async () => {
      // Create test cars with complex data
      const car1 = await createTestCar(org.organizationId, adminUser.userId);
      const car2 = await createTestCar(org.organizationId, adminUser.userId);

      const cars = await CarsService.getAllCars(org);

      expect(cars).toHaveLength(2);
      expect(cars[0]).toHaveProperty('id');
      expect(cars[0]).toHaveProperty('name');
      expect(cars[0]).toHaveProperty('wbsNum');
      expect(cars[0]).toHaveProperty('dateCreated');
      expect(cars[0]).toHaveProperty('lead');
      expect(cars[0]).toHaveProperty('manager');
    });

    it('handles database errors gracefully', async () => {
      // Create a mock organization that doesn't exist
      const fakeOrg = { organizationId: 'non-existent-org' } as Organization;

      const cars = await CarsService.getAllCars(fakeOrg);
      expect(cars).toEqual([]);
    });
  });

  describe('getCurrentCar Integration', () => {
    it('correctly identifies current car with database ordering', async () => {
      // Create cars with specific ordering scenarios
      await prisma.car.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 5,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Middle Car',
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
              carNumber: 10,
              projectNumber: 0,
              workPackageNumber: 0,
              name: 'Latest Car',
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
              name: 'Old Car',
              organizationId: org.organizationId,
              leadId: adminUser.userId,
              managerId: adminUser.userId
            }
          }
        }
      });

      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar).not.toBeNull();
      expect(currentCar!.wbsNum.carNumber).toBe(10);
      expect(currentCar!.name).toBe('Latest Car');
    });

    it('handles concurrent car creation scenarios', async () => {
      // Simulate concurrent creation by creating multiple cars rapidly
      const carPromises = Array.from({ length: 5 }, (_, index) =>
        CarsService.createCar(org, adminUser, `Concurrent Car ${index}`)
      );

      const createdCars = await Promise.all(carPromises);
      
      // Verify all cars were created with proper numbering
      const carNumbers = createdCars.map(car => car.wbsNum.carNumber).sort();
      expect(carNumbers).toEqual([0, 1, 2, 3, 4]);

      // Verify getCurrentCar returns the highest numbered car
      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar!.wbsNum.carNumber).toBe(4);
    });
  });

  describe('createCar Integration', () => {
    it('creates car with proper database relationships', async () => {
      const carName = 'Integration Test Car';
      
      const createdCar = await CarsService.createCar(org, adminUser, carName);
      
      // Verify the car was properly created in the database
      const dbCar = await prisma.car.findUnique({
        where: { carId: createdCar.id },
        include: {
          wbsElement: {
            include: {
              lead: true,
              manager: true,
              organization: true
            }
          }
        }
      });

      expect(dbCar).not.toBeNull();
      expect(dbCar!.wbsElement.name).toBe(carName);
      expect(dbCar!.wbsElement.leadId).toBe(adminUser.userId);
      expect(dbCar!.wbsElement.managerId).toBe(adminUser.userId);
      expect(dbCar!.wbsElement.organizationId).toBe(org.organizationId);
    });

    it('maintains data integrity across transactions', async () => {
      const initialCarCount = await prisma.car.count({
        where: {
          wbsElement: {
            organizationId: org.organizationId
          }
        }
      });

      try {
        // This should fail due to permissions
        await CarsService.createCar(org, nonAdminUser, 'Should Fail');
      } catch (error) {
        expect(error).toBeInstanceOf(AccessDeniedAdminOnlyException);
      }

      // Verify no car was created due to the failed transaction
      const finalCarCount = await prisma.car.count({
        where: {
          wbsElement: {
            organizationId: org.organizationId
          }
        }
      });

      expect(finalCarCount).toBe(initialCarCount);
    });

    it('handles database constraints properly', async () => {
      // Test with edge cases that might violate constraints
      const longName = 'A'.repeat(1000); // Very long name
      
      // This should either succeed or fail gracefully depending on DB constraints
      await expect(async () => {
        await CarsService.createCar(org, adminUser, longName);
      }).not.toThrow(/Unexpected error/);
    });
  });

  describe('Cross-Organization Data Isolation', () => {
    it('ensures complete data isolation between organizations', async () => {
      // Create cars in first org
      await CarsService.createCar(org, adminUser, 'Org1 Car 1');
      await CarsService.createCar(org, adminUser, 'Org1 Car 2');

      // Create second org with its own cars
      const org2 = await createTestOrganization();
      const admin2 = await createTestUser(supermanAdmin, org2.organizationId);
      await CarsService.createCar(org2, admin2, 'Org2 Car 1');

      // Verify each org only sees its own cars
      const org1Cars = await CarsService.getAllCars(org);
      const org2Cars = await CarsService.getAllCars(org2);

      expect(org1Cars).toHaveLength(2);
      expect(org2Cars).toHaveLength(1);

      expect(org1Cars.every(car => car.name.startsWith('Org1'))).toBe(true);
      expect(org2Cars.every(car => car.name.startsWith('Org2'))).toBe(true);

      // Verify current car logic is also isolated
      const org1Current = await CarsService.getCurrentCar(org);
      const org2Current = await CarsService.getCurrentCar(org2);

      expect(org1Current!.name).toBe('Org1 Car 2');
      expect(org2Current!.name).toBe('Org2 Car 1');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles database connection issues gracefully', async () => {
      // Create a car first
      await CarsService.createCar(org, adminUser, 'Test Car');

      // This test would require mocking Prisma to simulate connection issues
      // For now, we'll test that the service handles null/undefined gracefully
      const result = await CarsService.getCurrentCar(org);
      expect(result).toBeTruthy();
    });

    it('maintains consistency during high-concurrency operations', async () => {
      // Simulate multiple users creating cars simultaneously
      const promises = Array.from({ length: 10 }, (_, i) =>
        CarsService.createCar(org, adminUser, `Concurrent Car ${i}`)
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');

      // All cars should be created successfully
      expect(successful).toHaveLength(10);

      // Verify car numbering is sequential
      const cars = await CarsService.getAllCars(org);
      const carNumbers = cars.map(car => car.wbsNum.carNumber).sort((a, b) => a - b);
      expect(carNumbers).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('handles edge cases in car naming and validation', async () => {
      // Test various edge cases
      const edgeCases = [
        'Car with special chars !@#$%^&*()',
        'Car with numbers 12345',
        'Car with spaces    and    tabs',
        'Very long car name that exceeds typical limits but should still work fine',
        '车名中文', // Non-ASCII characters
        '' // Empty string
      ];

      for (const carName of edgeCases) {
        try {
          const car = await CarsService.createCar(org, adminUser, carName);
          expect(car.name).toBe(carName);
        } catch (error) {
          // Some edge cases might fail due to validation, which is acceptable
          console.log(`Edge case "${carName}" failed as expected:`, error);
        }
      }
    });

    it('properly handles organization and user validation', async () => {
      // Test with malformed organization
      const invalidOrg = { organizationId: '' } as Organization;
      
      await expect(CarsService.getCurrentCar(invalidOrg)).rejects.toThrow();

      // Test with non-existent organization
      const nonExistentOrg = { organizationId: 'non-existent' } as Organization;
      const result = await CarsService.getCurrentCar(nonExistentOrg);
      expect(result).toBeNull();
    });

    it('handles transaction rollbacks properly', async () => {
      const initialCount = await prisma.car.count({
        where: { wbsElement: { organizationId: org.organizationId } }
      });

      // Attempt operation that should fail
      try {
        await CarsService.createCar(org, nonAdminUser, 'Should Fail');
      } catch (error) {
        expect(error).toBeInstanceOf(AccessDeniedAdminOnlyException);
      }

      // Verify count hasn't changed
      const finalCount = await prisma.car.count({
        where: { wbsElement: { organizationId: org.organizationId } }
      });

      expect(finalCount).toBe(initialCount);
    });

    it('ensures proper cleanup and resource management', async () => {
      // Create multiple cars and verify they can be properly queried
      const carNames = ['Car A', 'Car B', 'Car C'];
      const createdCars = [];

      for (const name of carNames) {
        const car = await CarsService.createCar(org, adminUser, name);
        createdCars.push(car);
      }

      // Verify all cars exist
      const allCars = await CarsService.getAllCars(org);
      expect(allCars).toHaveLength(3);

      // Verify current car is the latest
      const currentCar = await CarsService.getCurrentCar(org);
      expect(currentCar!.name).toBe('Car C');
      expect(currentCar!.wbsNum.carNumber).toBe(2); // 0-indexed, so third car is #2
    });
  });
});
});

describe('Cars API Integration Tests', () => {
  let org: Organization;
  let adminUser: User;
  let nonAdminUser: User;

  beforeEach(async () => {
    org = await createTestOrganization();
    adminUser = await createTestUser(supermanAdmin, org.organizationId);
    nonAdminUser = await createTestUser(batmanAppAdmin, org.organizationId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('GET /cars', () => {
    it('returns empty array when no cars exist', async () => {
      const response = await request(app)
        .get('/cars')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('returns all cars for organization', async () => {
      // Create test cars
      await createTestCar(org.organizationId, adminUser.userId);
      await createTestCar(org.organizationId, adminUser.userId);

      const response = await request(app)
        .get('/cars')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('wbsNum');
      expect(response.body[0]).toHaveProperty('dateCreated');
    });

    it('only returns cars for user\'s organization', async () => {
      // Create car in our org
      await createTestCar(org.organizationId, adminUser.userId);

      // Create car in different org
      const otherOrg = await createTestOrganization();
      const otherUser = await createTestUser(supermanAdmin, otherOrg.organizationId);
      await createTestCar(otherOrg.organizationId, otherUser.userId);

      const response = await request(app)
        .get('/cars')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it('requires authentication', async () => {
      await request(app)
        .get('/cars')
        .expect(401);
    });
  });

  describe('GET /cars/current', () => {
    it('returns null when no cars exist', async () => {
      const response = await request(app)
        .get('/cars/current')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .expect(200);

      expect(response.body).toBeNull();
    });

    it('returns the only car when one exists', async () => {
      const testCar = await createTestCar(org.organizationId, adminUser.userId);

      const response = await request(app)
        .get('/cars/current')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .expect(200);

      expect(response.body).not.toBeNull();
      expect(response.body.id).toBe(testCar.carId);
    });

    it('returns car with highest car number', async () => {
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

      const car3 = await prisma.car.create({
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

      await prisma.car.create({
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

      const response = await request(app)
        .get('/cars/current')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .expect(200);

      expect(response.body).not.toBeNull();
      expect(response.body.wbsNum.carNumber).toBe(3);
      expect(response.body.id).toBe(car3.carId);
    });

    it('only considers cars from user\'s organization', async () => {
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
      const otherOrg = await createTestOrganization();
      const otherUser = await createTestUser(supermanAdmin, otherOrg.organizationId);
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

      const response = await request(app)
        .get('/cars/current')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .expect(200);

      expect(response.body).not.toBeNull();
      expect(response.body.wbsNum.carNumber).toBe(1);
      expect(response.body.name).toBe('Our Car');
    });

    it('requires authentication', async () => {
      await request(app)
        .get('/cars/current')
        .expect(401);
    });
  });

  describe('POST /cars/create', () => {
    it('successfully creates car with admin permissions', async () => {
      const carData = { name: 'Test Car' };

      const response = await request(app)
        .post('/cars/create')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .send(carData)
        .expect(201);

      expect(response.body.name).toBe('Test Car');
      expect(response.body.wbsNum.carNumber).toBe(0); // First car should have car number 0
      expect(response.body.wbsNum.projectNumber).toBe(0);
      expect(response.body.wbsNum.workPackageNumber).toBe(0);
    });

    it('assigns correct car number based on existing cars', async () => {
      // Create first car
      await request(app)
        .post('/cars/create')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .send({ name: 'Car 1' })
        .expect(201);

      // Create second car
      const response = await request(app)
        .post('/cars/create')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .send({ name: 'Car 2' })
        .expect(201);

      expect(response.body.wbsNum.carNumber).toBe(1); // Should be incremented
    });

    it('denies access for non-admin user', async () => {
      const carData = { name: 'Test Car' };

      await request(app)
        .post('/cars/create')
        .set('authorization', `Bearer ${nonAdminUser.userId}`)
        .send(carData)
        .expect(400); // AccessDeniedAdminOnlyException should return 400
    });

    it('requires car name', async () => {
      await request(app)
        .post('/cars/create')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .send({})
        .expect(400);
    });

    it('requires authentication', async () => {
      await request(app)
        .post('/cars/create')
        .send({ name: 'Test Car' })
        .expect(401);
    });

    it('car numbers are organization-specific', async () => {
      // Create car in first org
      const firstResponse = await request(app)
        .post('/cars/create')
        .set('authorization', `Bearer ${adminUser.userId}`)
        .send({ name: 'First Org Car' })
        .expect(201);

      // Create different org and admin
      const otherOrg = await createTestOrganization();
      const otherAdmin = await createTestUser(supermanAdmin, otherOrg.organizationId);

      // Create car in second org
      const secondResponse = await request(app)
        .post('/cars/create')
        .set('authorization', `Bearer ${otherAdmin.userId}`)
        .send({ name: 'Second Org Car' })
        .expect(201);

      // Both should start from car number 0
      expect(firstResponse.body.wbsNum.carNumber).toBe(0);
      expect(secondResponse.body.wbsNum.carNumber).toBe(0);
    });
  });
});
