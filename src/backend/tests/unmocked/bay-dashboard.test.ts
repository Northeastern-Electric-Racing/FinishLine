import { Organization, User } from '@prisma/client';
import { BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';
import prisma from '../../src/prisma/prisma.js';
import BayDashboardAdminService from '../../src/services/bay-dashboard-admin.services.js';
import { AccessDeniedException } from '../../src/utils/errors.utils.js';
import { batmanAppAdmin, greenlanternHead, member } from '../test-data/users.test-data.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';

describe('Bay Dashboard Admin Tests', () => {
  let organization: Organization;
  let head: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    head = await createTestUser(greenlanternHead, organization.organizationId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  const createConfig = async (dateCreated: Date, dateDeleted?: Date, orgId = organization.organizationId) =>
    await prisma.bay_Dashboard_Config.create({
      data: {
        dateCreated,
        dateDeleted,
        userCreatedId: head.userId,
        organizationId: orgId,
        slots: {
          create: [
            {
              size: BayDashboardWidgetSize.SMALL,
              position: 2,
              widgets: { create: [{ type: BayDashboardWidgetType.MBTA_TRACKER, order: 0 }] }
            },
            {
              size: BayDashboardWidgetSize.LARGE,
              position: 0,
              rotationSeconds: 45,
              widgets: {
                create: [
                  { type: BayDashboardWidgetType.TEXT_FIELD, order: 1, text: 'Welcome to the bay' },
                  { type: BayDashboardWidgetType.CALENDAR, order: 0 }
                ]
              }
            }
          ]
        }
      }
    });

  describe('Get Current Bay Dashboard Config', () => {
    it('Fails if user is a member', async () => {
      const memberUser = await createTestUser(member, organization.organizationId);

      await expect(BayDashboardAdminService.getCurrentBayDashboardConfig(memberUser, organization)).rejects.toThrow(
        new AccessDeniedException('Only heads and above can view the bay dashboard config')
      );
    });

    it('Returns null if the organization has no config', async () => {
      const config = await BayDashboardAdminService.getCurrentBayDashboardConfig(head, organization);

      expect(config).toBeNull();
    });

    it('Returns the latest non-deleted config for the organization', async () => {
      await createConfig(new Date('2026-01-01'));
      const expected = await createConfig(new Date('2026-02-01'));
      // newer but deleted
      await createConfig(new Date('2026-03-01'), new Date('2026-03-02'));
      // newer but in another organization
      const otherOrg = await prisma.organization.create({
        data: { name: 'Other Org', slug: 'other-org', description: '', userCreatedId: head.userId }
      });
      await createConfig(new Date('2026-04-01'), undefined, otherOrg.organizationId);

      const config = await BayDashboardAdminService.getCurrentBayDashboardConfig(head, organization);

      expect(config?.bayDashboardConfigId).toBe(expected.bayDashboardConfigId);
      expect(config?.slots.map((slot) => slot.position)).toEqual([0, 2]);
      expect(config?.slots[0].rotationSeconds).toBe(45);
      expect(config?.slots[0].widgets).toEqual([
        expect.objectContaining({ type: BayDashboardWidgetType.CALENDAR, order: 0, text: undefined }),
        expect.objectContaining({ type: BayDashboardWidgetType.TEXT_FIELD, order: 1, text: 'Welcome to the bay' })
      ]);
    });

    it('Succeeds for an app admin', async () => {
      const admin = await createTestUser(batmanAppAdmin, organization.organizationId);
      const expected = await createConfig(new Date('2026-01-01'));

      const config = await BayDashboardAdminService.getCurrentBayDashboardConfig(admin, organization);

      expect(config?.bayDashboardConfigId).toBe(expected.bayDashboardConfigId);
    });
  });
});
