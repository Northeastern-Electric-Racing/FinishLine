import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import CalendarService from '../../src/services/calendar.services';
import { createTestUser, createTestOrganization, resetUsers, CreateTestUserParams } from '../test-utils';
import { RoleEnum } from 'shared';
import CalendarController from '../../src/controllers/calendar.controllers';

const prisma = new PrismaClient();

describe('Calendar Service', () => {
  let adminUser: any;
  let regularUser: any;
  let testOrganization: any;

  beforeAll(async () => {
    await resetUsers();
    testOrganization = await createTestOrganization();

    const adminParams: CreateTestUserParams = {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'test-admin@test.com',
      googleAuthId: 'test-admin-google-id',
      role: RoleEnum.APP_ADMIN
    };

    const userParams: CreateTestUserParams = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test-user@test.com',
      googleAuthId: 'test-user-google-id',
      role: RoleEnum.MEMBER
    };

    adminUser = await createTestUser(adminParams, testOrganization.organizationId);
    regularUser = await createTestUser(userParams, testOrganization.organizationId);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.calendar.deleteMany({
      where: {
        name: {
          contains: 'Test Calendar'
        }
      }
    });
  });

  describe('createCalendar Service', () => {
    it('should create calendar successfully', async () => {
      const calendarData = {
        name: 'Test Calendar Success',
        description: 'Test calendar description',
        colorHexCode: '#ff0000',
        userCreatedId: adminUser.userId
      };

      const calendar = await CalendarService.createCalendar(calendarData);

      expect(calendar).toHaveProperty('calendarId');
      expect(calendar.name).toBe(calendarData.name);
      expect(calendar.description).toBe(calendarData.description);
      expect(calendar.colorHexCode).toBe(calendarData.colorHexCode);
    });

    it('should create calendar with special characters', async () => {
      const calendarData = {
        name: 'Test Calendar with Special chars: !@#$%',
        description: 'Description with special chars',
        colorHexCode: '#purple',
        userCreatedId: adminUser.userId
      };

      const calendar = await CalendarService.createCalendar(calendarData);
      expect(calendar.name).toBe(calendarData.name);
      expect(calendar.description).toBe(calendarData.description);
    });
  });

  describe('createCalendar Controller - Admin Validation', () => {
    it('should create calendar when user has admin permissions', async () => {
      const mockReq = {
        currentUser: {
          userId: adminUser.userId,
          additionalPermissions: ['admin']
        },
        body: {
          name: 'Test Admin Calendar',
          description: 'Test description',
          color: '#ff0000'
        }
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      const mockNext = vi.fn();

      await CalendarController.createCalendar(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Admin Calendar',
          description: 'Test description',
          colorHexCode: '#ff0000'
        })
      );
    });

    it('should reject when user lacks admin permissions', async () => {
      const mockReq = {
        currentUser: {
          userId: regularUser.userId,
          additionalPermissions: ['member']
        },
        body: {
          name: 'Test Calendar',
          description: 'Test description',
          color: '#ff0000'
        }
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      const mockNext = vi.fn();

      await CalendarController.createCalendar(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Forbidden: Admin access required to create calendars'
      });
    });

    it('should reject when user is not authenticated', async () => {
      const mockReq = {
        currentUser: null,
        body: {
          name: 'Test Calendar',
          description: 'Test description',
          color: '#ff0000'
        }
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      const mockNext = vi.fn();

      await CalendarController.createCalendar(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Unauthorized: Authentication required'
      });
    });

    it('should reject when user has no additional permissions', async () => {
      const mockReq = {
        currentUser: {
          userId: regularUser.userId,
          additionalPermissions: null
        },
        body: {
          name: 'Test Calendar',
          description: 'Test description',
          color: '#ff0000'
        }
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      const mockNext = vi.fn();

      await CalendarController.createCalendar(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Forbidden: Admin access required to create calendars'
      });
    });
  });
});

async function cleanupTestData() {
  await prisma.calendar.deleteMany({
    where: {
      name: { contains: 'Test Calendar' }
    }
  });
}
