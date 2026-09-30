import { Organization } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { greenlanternHead, member } from '../test-data/users.test-data.js';
import { BayDashboardSlotInput } from 'shared';
import BayDashboardAdminService from '../../src/services/bay-dashboard-admin.services.js';
import { AccessDeniedException, HttpException } from '../../src/utils/errors.utils.js';
import prisma from '../../src/prisma/prisma.js';

const textSlot = (position: number, text: string): BayDashboardSlotInput => ({
  position,
  size: 'LARGE',
  widget: { type: 'TEXT_FIELD', text }
});

describe('Bay Dashboard Admin Tests', () => {
  let organization: Organization;
  let orgId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Save Bay Dashboard Config', () => {
    it('fails when a member tries to save the config', async () => {
      const regularMember = await createTestUser(member, orgId);

      await expect(
        BayDashboardAdminService.saveBayDashboardConfig(regularMember as any, organization, [textSlot(0, 'Nope')])
      ).rejects.toThrow(new AccessDeniedException('Only heads and above can save the bay dashboard config'));
    });

    it('saves a config with a widget for a head', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const config = await BayDashboardAdminService.saveBayDashboardConfig(head as any, organization, [
        { position: 0, size: 'LARGE', rotationSeconds: 15, widget: { type: 'CALENDAR' } }
      ]);

      expect(config.organizationId).toBe(orgId);
      expect(config.userCreatedId).toBe(head.userId);
      expect(config.dateDeleted).toBeNull();
      expect(config.slots).toHaveLength(1);
      expect(config.slots[0].position).toBe(0);
      expect(config.slots[0].size).toBe('LARGE');
      expect(config.slots[0].rotationSeconds).toBe(15);
      expect(config.slots[0].widgets).toHaveLength(1);
      expect(config.slots[0].widgets[0].type).toBe('CALENDAR');
      expect(config.slots[0].widgets[0].order).toBe(0);
    });

    it('returns slots ordered by position', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const config = await BayDashboardAdminService.saveBayDashboardConfig(head as any, organization, [
        textSlot(2, 'third'),
        textSlot(0, 'first'),
        textSlot(1, 'second')
      ]);

      expect(config.slots.map((slot) => slot.position)).toEqual([0, 1, 2]);
      expect(config.slots.map((slot) => slot.widgets[0].text)).toEqual(['first', 'second', 'third']);
    });

    it('saves a slot with no widget', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const config = await BayDashboardAdminService.saveBayDashboardConfig(head as any, organization, [
        { position: 0, size: 'SMALL' }
      ]);

      expect(config.slots).toHaveLength(1);
      expect(config.slots[0].widgets).toHaveLength(0);
    });

    it('falls back to the default rotation when none is given', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const config = await BayDashboardAdminService.saveBayDashboardConfig(head as any, organization, [
        textSlot(0, 'Welcome to the Bay')
      ]);

      expect(config.slots[0].rotationSeconds).toBe(30);
    });

    it('soft deletes the previous config so only the newest stays active', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const oldConfig = await BayDashboardAdminService.saveBayDashboardConfig(head as any, organization, [
        textSlot(0, 'old')
      ]);
      const newConfig = await BayDashboardAdminService.saveBayDashboardConfig(head as any, organization, [
        textSlot(0, 'new')
      ]);

      const oldConfigAfterSave = await prisma.bay_Dashboard_Config.findUnique({
        where: { bayDashboardConfigId: oldConfig.bayDashboardConfigId }
      });
      expect(oldConfigAfterSave?.dateDeleted).not.toBeNull();

      const activeConfigs = await prisma.bay_Dashboard_Config.findMany({
        where: { organizationId: orgId, dateDeleted: null }
      });
      expect(activeConfigs).toHaveLength(1);
      expect(activeConfigs[0].bayDashboardConfigId).toBe(newConfig.bayDashboardConfigId);
    });

    it('leaves another organization`s config untouched', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      // created inline rather than with createTestOrganization, which always uses the same unique slug
      const otherOrganization = await prisma.organization.create({
        data: {
          name: 'Other Org',
          slug: 'other-org',
          description: 'A second organization',
          applicationLink: '',
          userCreated: { connect: { userId: head.userId } }
        }
      });
      const otherHead = await createTestUser(
        { ...greenlanternHead, googleAuthId: 'otherOrgHead', email: 'other.head@test.com', emailId: 'other.head' },
        otherOrganization.organizationId
      );

      const otherConfig = await BayDashboardAdminService.saveBayDashboardConfig(otherHead as any, otherOrganization, [
        textSlot(0, 'other org')
      ]);
      await BayDashboardAdminService.saveBayDashboardConfig(head as any, organization, [textSlot(0, 'this org')]);

      const otherConfigAfterSave = await prisma.bay_Dashboard_Config.findUnique({
        where: { bayDashboardConfigId: otherConfig.bayDashboardConfigId }
      });
      expect(otherConfigAfterSave?.dateDeleted).toBeNull();
    });

    it('fails when two slots share a position', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      await expect(
        BayDashboardAdminService.saveBayDashboardConfig(head as any, organization, [
          textSlot(0, 'first'),
          textSlot(0, 'duplicate')
        ])
      ).rejects.toThrow(new HttpException(400, 'Each slot must have a unique position'));
    });
  });
});
