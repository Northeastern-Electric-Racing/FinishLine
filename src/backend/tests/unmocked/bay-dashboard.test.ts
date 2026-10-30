import { Organization, User } from '@prisma/client';
import { BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';
import prisma from '../../src/prisma/prisma.js';
import BayDashboardAdminService from '../../src/services/bay-dashboard-admin.services.js';
import BayDashboardService from '../../src/services/bay-dashboard.services.js';
import { widgetDetails } from '../../src/utils/bay-dashboard.utils.js';
import { AccessDeniedException, DeletedException, NotFoundException } from '../../src/utils/errors.utils.js';
import { batmanAppAdmin, greenlanternHead, member } from '../test-data/users.test-data.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';

describe('Bay Dashboard Tests', () => {
  let organization: Organization;
  let head: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    head = await createTestUser(greenlanternHead, organization.organizationId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  const createConfig = async (
    dateCreated: Date,
    dateDeleted?: Date,
    orgId = organization.organizationId,
    text = 'Welcome to the bay'
  ) =>
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
                  { type: BayDashboardWidgetType.TEXT_FIELD, order: 1, text },
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

  describe('Get Available Widgets', () => {
    it('Fails if user is a member', async () => {
      const memberUser = await createTestUser(member, organization.organizationId);

      await expect(BayDashboardAdminService.getAvailableWidgets(memberUser, organization)).rejects.toThrow(
        new AccessDeniedException('Only heads and above can view the available bay dashboard widgets')
      );
    });

    it('Returns the widgets that can be placed on the dashboard', async () => {
      const { widgets } = await BayDashboardAdminService.getAvailableWidgets(head, organization);

      const types = widgets.map((widget) => widget.type);
      expect(types).toEqual(
        expect.arrayContaining([
          BayDashboardWidgetType.CALENDAR,
          BayDashboardWidgetType.OVERDUE_WORK_PACKAGES,
          BayDashboardWidgetType.TEXT_FIELD
        ])
      );
      widgets.forEach((widget) => {
        expect(widget.displayName).toBeTruthy();
        expect(widget.sizes.length).toBeGreaterThan(0);
      });
    });

    it('Leaves out widget types that do not support any size', async () => {
      const { widgets } = await BayDashboardAdminService.getAvailableWidgets(head, organization);

      const unavailableTypes = Object.values(BayDashboardWidgetType).filter(
        (type) => widgetDetails[type].sizes.length === 0
      );
      const types = widgets.map((widget) => widget.type);
      unavailableTypes.forEach((type) => expect(types).not.toContain(type));
    });

    it('Succeeds for an app admin', async () => {
      const admin = await createTestUser(batmanAppAdmin, organization.organizationId);

      const { widgets } = await BayDashboardAdminService.getAvailableWidgets(admin, organization);

      expect(widgets.length).toBeGreaterThan(0);
    });
  });

  describe('Get Public Bay Dashboard Config', () => {
    it('Fails if the slug does not belong to an organization', async () => {
      await expect(BayDashboardService.getBayDashboardConfig('not-a-real-slug')).rejects.toThrow(
        new NotFoundException('Organization', 'not-a-real-slug')
      );
    });

    it('Fails if the organization is deleted', async () => {
      await prisma.organization.update({
        where: { organizationId: organization.organizationId },
        data: { dateDeleted: new Date() }
      });

      await expect(BayDashboardService.getBayDashboardConfig(organization.slug)).rejects.toThrow(
        new DeletedException('Organization', organization.slug)
      );
    });

    it('Needs no user, only the organization slug', async () => {
      await createConfig(new Date('2026-01-01'));

      const config = await BayDashboardService.getBayDashboardConfig(organization.slug);

      expect(config?.slots).toHaveLength(2);
    });

    it('Returns null if the organization has no config', async () => {
      const config = await BayDashboardService.getBayDashboardConfig(organization.slug);

      expect(config).toBeNull();
    });

    it('Returns the latest non-deleted config for the organization', async () => {
      await createConfig(new Date('2026-01-01'), undefined, organization.organizationId, 'older');
      await createConfig(new Date('2026-02-01'), undefined, organization.organizationId, 'expected');
      // newer but deleted
      await createConfig(new Date('2026-03-01'), new Date('2026-03-02'), organization.organizationId, 'deleted');
      // newer but in another organization
      const otherOrg = await prisma.organization.create({
        data: { name: 'Other Org', slug: 'other-org', description: '', userCreatedId: head.userId }
      });
      await createConfig(new Date('2026-04-01'), undefined, otherOrg.organizationId, 'other org');

      const config = await BayDashboardService.getBayDashboardConfig(organization.slug);

      expect(config?.slots.map((slot) => slot.position)).toEqual([0, 2]);
      expect(config?.slots[0].rotationSeconds).toBe(45);
      expect(config?.slots[0].widgets).toEqual([
        expect.objectContaining({ type: BayDashboardWidgetType.CALENDAR, order: 0, text: undefined }),
        expect.objectContaining({ type: BayDashboardWidgetType.TEXT_FIELD, order: 1, text: 'expected' })
      ]);
    });

    it('Returns only what the TV needs to render, with no ids or dates', async () => {
      await createConfig(new Date('2026-01-01'));

      const config = await BayDashboardService.getBayDashboardConfig(organization.slug);

      expect(Object.keys(config ?? {})).toEqual(['slots']);
      config?.slots.forEach((slot) => {
        expect(Object.keys(slot).sort()).toEqual(['position', 'rotationSeconds', 'size', 'widgets']);
        slot.widgets.forEach((widget) => expect(Object.keys(widget).sort()).toEqual(['order', 'text', 'type']));
      });
    });
  });

  describe('Get Bay Dashboard Countdowns', () => {
    const createCountdown = async (name: string, dateDeleted?: Date, orgId = organization.organizationId) =>
      await prisma.bay_Dashboard_Countdown.create({
        data: { name, startDate: new Date('2026-01-01'), dateDeleted, userCreatedId: head.userId, organizationId: orgId }
      });

    it('Fails if the slug does not belong to an organization', async () => {
      await expect(BayDashboardService.getBayDashboardCountdowns('not-a-real-slug')).rejects.toThrow(
        new NotFoundException('Organization', 'not-a-real-slug')
      );
    });

    it('Fails if the organization is deleted', async () => {
      await prisma.organization.update({
        where: { organizationId: organization.organizationId },
        data: { dateDeleted: new Date() }
      });

      await expect(BayDashboardService.getBayDashboardCountdowns(organization.slug)).rejects.toThrow(
        new DeletedException('Organization', organization.slug)
      );
    });

    it('Returns the non-deleted countdowns for the organization', async () => {
      const expected = await createCountdown('FHE');
      await createCountdown('deleted', new Date('2026-02-01'));
      const otherOrg = await prisma.organization.create({
        data: { name: 'Other Org', slug: 'other-org', description: '', userCreatedId: head.userId }
      });
      await createCountdown('other org', undefined, otherOrg.organizationId);

      const countdowns = await BayDashboardService.getBayDashboardCountdowns(organization.slug);

      expect(countdowns).toEqual([
        {
          bayDashboardCountdownId: expected.bayDashboardCountdownId,
          name: 'FHE',
          startDate: new Date('2026-01-01'),
          endDate: undefined,
          isPrimary: false
        }
      ]);
    });
  });
});
