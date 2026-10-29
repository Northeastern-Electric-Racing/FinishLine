import { Organization } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { greenlanternHead, member } from '../test-data/users.test-data.js';
import { BayDashboardSlotCreateArgs, BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';
import BayDashboardAdminService from '../../src/services/bay-dashboard-admin.services.js';
import {
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../../src/utils/errors.utils.js';
import prisma from '../../src/prisma/prisma.js';

// the size the TV lays out at each position
const SIZE_BY_POSITION: Record<number, BayDashboardWidgetSize> = {
  0: BayDashboardWidgetSize.LARGE,
  1: BayDashboardWidgetSize.MEDIUM,
  2: BayDashboardWidgetSize.SMALL
};

const textSlot = (position: number, text: string): BayDashboardSlotCreateArgs => ({
  position,
  size: SIZE_BY_POSITION[position],
  widget: { type: BayDashboardWidgetType.TEXT_FIELD, text }
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
        BayDashboardAdminService.saveBayDashboardConfig(regularMember, organization, [textSlot(0, 'Nope')])
      ).rejects.toThrow(new AccessDeniedException('Only heads and above can save the bay dashboard config'));
    });

    it('saves a config with a widget for a head', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const config = await BayDashboardAdminService.saveBayDashboardConfig(head, organization, [
        {
          position: 0,
          size: BayDashboardWidgetSize.LARGE,
          widget: { type: BayDashboardWidgetType.CALENDAR }
        }
      ]);

      expect(config.slots).toHaveLength(3);
      expect(config.slots[0].position).toBe(0);
      expect(config.slots[0].size).toBe(BayDashboardWidgetSize.LARGE);
      expect(config.slots[0].widgets).toHaveLength(1);
      expect(config.slots[0].widgets[0].type).toBe(BayDashboardWidgetType.CALENDAR);
      expect(config.slots[0].widgets[0].order).toBe(0);
    });

    it('returns slots ordered by position', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const config = await BayDashboardAdminService.saveBayDashboardConfig(head, organization, [
        textSlot(2, 'third'),
        textSlot(0, 'first'),
        textSlot(1, 'second')
      ]);

      expect(config.slots.map((slot) => slot.position)).toEqual([0, 1, 2]);
      expect(config.slots.map((slot) => slot.widgets[0].text)).toEqual(['first', 'second', 'third']);
    });

    it('fills positions that are left out or have no widget with their defaults', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const config = await BayDashboardAdminService.saveBayDashboardConfig(head, organization, [
        textSlot(0, 'has a widget'),
        { position: 1, size: BayDashboardWidgetSize.MEDIUM }
      ]);

      expect(config.slots.map((slot) => slot.widgets.map((widget) => widget.type))).toEqual([
        [BayDashboardWidgetType.TEXT_FIELD],
        [BayDashboardWidgetType.OVERDUE_WORK_PACKAGES],
        [BayDashboardWidgetType.TEXT_FIELD]
      ]);
    });

    it('saves the whole default layout when no slots are given', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const config = await BayDashboardAdminService.saveBayDashboardConfig(head, organization, []);

      expect(config.slots.map((slot) => slot.widgets.map((widget) => widget.type))).toEqual([
        [BayDashboardWidgetType.CALENDAR],
        [BayDashboardWidgetType.OVERDUE_WORK_PACKAGES],
        [BayDashboardWidgetType.TEXT_FIELD]
      ]);
    });

    it('soft deletes the previous config so only the newest stays active', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const oldConfig = await BayDashboardAdminService.saveBayDashboardConfig(head, organization, [textSlot(0, 'old')]);
      const newConfig = await BayDashboardAdminService.saveBayDashboardConfig(head, organization, [textSlot(0, 'new')]);

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

    it('fails when a widget is placed in a size it does not support', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      await expect(
        BayDashboardAdminService.saveBayDashboardConfig(head, organization, [
          { position: 2, size: BayDashboardWidgetSize.SMALL, widget: { type: BayDashboardWidgetType.CALENDAR } }
        ])
      ).rejects.toThrow(
        new HttpException(
          400,
          `Slot position 2: ${BayDashboardWidgetType.CALENDAR} widgets can't be ${BayDashboardWidgetSize.SMALL}`
        )
      );
    });

    it('keeps the previous config active when the new config fails to save', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const oldConfig = await BayDashboardAdminService.saveBayDashboardConfig(head, organization, [textSlot(0, 'old')]);

      await expect(
        BayDashboardAdminService.saveBayDashboardConfig(head, organization, [
          { position: 0, size: BayDashboardWidgetSize.LARGE, widget: { type: 'NOT_A_WIDGET_TYPE' as any } }
        ])
      ).rejects.toThrow(new HttpException(400, 'Slot position 0: NOT_A_WIDGET_TYPE is not a valid widget type'));

      const activeConfigs = await prisma.bay_Dashboard_Config.findMany({
        where: { organizationId: orgId, dateDeleted: null }
      });
      expect(activeConfigs).toHaveLength(1);
      expect(activeConfigs[0].bayDashboardConfigId).toBe(oldConfig.bayDashboardConfigId);
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

      const otherConfig = await BayDashboardAdminService.saveBayDashboardConfig(otherHead, otherOrganization, [
        textSlot(0, 'other org')
      ]);
      await BayDashboardAdminService.saveBayDashboardConfig(head, organization, [textSlot(0, 'this org')]);

      const otherConfigAfterSave = await prisma.bay_Dashboard_Config.findUnique({
        where: { bayDashboardConfigId: otherConfig.bayDashboardConfigId }
      });
      expect(otherConfigAfterSave?.dateDeleted).toBeNull();
    });

    it('fails when two slots share a position', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      await expect(
        BayDashboardAdminService.saveBayDashboardConfig(head, organization, [textSlot(0, 'first'), textSlot(0, 'duplicate')])
      ).rejects.toThrow(new HttpException(400, 'Each slot must have a unique position'));
    });

    it('fails when a slot position is not part of the layout', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      await expect(
        BayDashboardAdminService.saveBayDashboardConfig(head, organization, [
          { position: 7, size: BayDashboardWidgetSize.SMALL }
        ])
      ).rejects.toThrow(new HttpException(400, 'Slot position 7 is not part of the bay dashboard layout'));
    });

    it('fails when a slot size does not match its position', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      await expect(
        BayDashboardAdminService.saveBayDashboardConfig(head, organization, [
          { position: 0, size: BayDashboardWidgetSize.SMALL }
        ])
      ).rejects.toThrow(new HttpException(400, 'Slot position 0 must be size LARGE'));
    });

    it('fails when two slots are both large', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      await expect(
        BayDashboardAdminService.saveBayDashboardConfig(head, organization, [
          { position: 0, size: BayDashboardWidgetSize.LARGE },
          { position: 1, size: BayDashboardWidgetSize.LARGE }
        ])
      ).rejects.toThrow(new HttpException(400, 'Slot position 1 must be size MEDIUM'));
    });

    it('does not change the active config when the layout check fails', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const oldConfig = await BayDashboardAdminService.saveBayDashboardConfig(head, organization, [textSlot(0, 'old')]);

      await expect(
        BayDashboardAdminService.saveBayDashboardConfig(head, organization, [
          { position: 7, size: BayDashboardWidgetSize.SMALL }
        ])
      ).rejects.toThrow(HttpException);

      const activeConfigs = await prisma.bay_Dashboard_Config.findMany({
        where: { organizationId: orgId, dateDeleted: null }
      });
      expect(activeConfigs).toHaveLength(1);
      expect(activeConfigs[0].bayDashboardConfigId).toBe(oldConfig.bayDashboardConfigId);
    });
  });

  describe('Create Bay Dashboard Countdown', () => {
    it('fails if user is not a head', async () => {
      const regularMember = await createTestUser(member, orgId);

      await expect(
        BayDashboardAdminService.createBayDashboardCountdown(regularMember, organization, 'FHE', new Date('2025-04-26'))
      ).rejects.toThrow(new AccessDeniedException('Only heads and above can create bay dashboard countdowns'));
    });

    it('creates a countdown without an end date', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'Days Since Last Bay Clean Up',
        new Date('2026-03-07')
      );

      expect(countdown.name).toBe('Days Since Last Bay Clean Up');
      expect(countdown.startDate).toEqual(new Date('2026-03-07'));
      expect(countdown.endDate).toBeUndefined();
    });

    it('creates a countdown with an end date', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26'),
        new Date('2026-04-26')
      );

      expect(countdown.name).toBe('FHE');
      expect(countdown.startDate).toEqual(new Date('2025-04-26'));
      expect(countdown.endDate).toEqual(new Date('2026-04-26'));
    });

    it('fails if end date is not after start date', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      await expect(
        BayDashboardAdminService.createBayDashboardCountdown(
          head,
          organization,
          'FHE',
          new Date('2026-04-26'),
          new Date('2025-04-26')
        )
      ).rejects.toThrow(new HttpException(400, 'End date must be after start date'));
    });
  });
  describe('Delete Bay Dashboard Countdown', () => {
    it('fails if user is not a head', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );
      const regularMember = await createTestUser(member, orgId);

      await expect(
        BayDashboardAdminService.deleteBayDashboardCountdown(regularMember, countdown.bayDashboardCountdownId, organization)
      ).rejects.toThrow(new AccessDeniedException('Only heads and above are allowed to delete bay dashboard countdowns'));
    });

    it('soft deletes a countdown for a head', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );

      await BayDashboardAdminService.deleteBayDashboardCountdown(head, countdown.bayDashboardCountdownId, organization);

      const deleted = await prisma.bay_Dashboard_Countdown.findUnique({
        where: { bayDashboardCountdownId: countdown.bayDashboardCountdownId }
      });
      expect(deleted?.dateDeleted).not.toBeNull();
      expect(deleted?.userDeletedId).toBe(head.userId);
    });

    it('fails if the countdown is already deleted', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );

      await BayDashboardAdminService.deleteBayDashboardCountdown(head, countdown.bayDashboardCountdownId, organization);

      await expect(
        BayDashboardAdminService.deleteBayDashboardCountdown(head, countdown.bayDashboardCountdownId, organization)
      ).rejects.toThrow(new DeletedException('Bay Dashboard Countdown', countdown.bayDashboardCountdownId));
    });

    it('fails if the countdown does not exist', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      await expect(
        BayDashboardAdminService.deleteBayDashboardCountdown(head, 'fake-countdown-id', organization)
      ).rejects.toThrow(new NotFoundException('Bay Dashboard Countdown', 'fake-countdown-id'));
    });

    it('fails if the countdown belongs to another organization', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );
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

      await expect(
        BayDashboardAdminService.deleteBayDashboardCountdown(otherHead, countdown.bayDashboardCountdownId, otherOrganization)
      ).rejects.toThrow(new InvalidOrganizationException('Bay Dashboard Countdown'));
    });
  });
  describe('Edit Bay Dashboard Countdown', () => {
    it('fails if user is not a head', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );
      const regularMember = await createTestUser(member, orgId);

      await expect(
        BayDashboardAdminService.editBayDashboardCountdown(
          regularMember,
          countdown.bayDashboardCountdownId,
          organization,
          'New Name',
          new Date('2025-04-26')
        )
      ).rejects.toThrow(new AccessDeniedException('Only heads and above can edit bay dashboard countdowns'));
    });

    it('edits a countdown for a head', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );

      const edited = await BayDashboardAdminService.editBayDashboardCountdown(
        head,
        countdown.bayDashboardCountdownId,
        organization,
        'Competition',
        new Date('2025-06-01'),
        new Date('2025-06-05')
      );

      expect(edited.name).toBe('Competition');
      expect(edited.startDate).toEqual(new Date('2025-06-01'));
      expect(edited.endDate).toEqual(new Date('2025-06-05'));
    });

    it('clears the end date when none is given', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26'),
        new Date('2025-04-27')
      );

      const edited = await BayDashboardAdminService.editBayDashboardCountdown(
        head,
        countdown.bayDashboardCountdownId,
        organization,
        'FHE',
        new Date('2025-04-26')
      );

      expect(edited.endDate).toBeUndefined();
    });

    it('fails if end date is not after start date', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );

      await expect(
        BayDashboardAdminService.editBayDashboardCountdown(
          head,
          countdown.bayDashboardCountdownId,
          organization,
          'FHE',
          new Date('2025-04-26'),
          new Date('2025-04-25')
        )
      ).rejects.toThrow(new HttpException(400, 'End date must be after start date'));
    });

    it('fails if the countdown does not exist', async () => {
      const head = await createTestUser(greenlanternHead, orgId);

      await expect(
        BayDashboardAdminService.editBayDashboardCountdown(
          head,
          'fake-countdown-id',
          organization,
          'FHE',
          new Date('2025-04-26')
        )
      ).rejects.toThrow(new NotFoundException('Bay Dashboard Countdown', 'fake-countdown-id'));
    });

    it('fails if the countdown is deleted', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );
      await BayDashboardAdminService.deleteBayDashboardCountdown(head, countdown.bayDashboardCountdownId, organization);

      await expect(
        BayDashboardAdminService.editBayDashboardCountdown(
          head,
          countdown.bayDashboardCountdownId,
          organization,
          'FHE',
          new Date('2025-04-26')
        )
      ).rejects.toThrow(new DeletedException('Bay Dashboard Countdown', countdown.bayDashboardCountdownId));
    });

    it('fails if the name is only whitespace', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );

      await expect(
        BayDashboardAdminService.editBayDashboardCountdown(
          head,
          countdown.bayDashboardCountdownId,
          organization,
          '   ',
          new Date('2025-04-26')
        )
      ).rejects.toThrow(new HttpException(400, 'The name must be non-empty'));
    });

    it('trims the name before saving', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );

      const edited = await BayDashboardAdminService.editBayDashboardCountdown(
        head,
        countdown.bayDashboardCountdownId,
        organization,
        '  Competition  ',
        new Date('2025-04-26')
      );

      expect(edited.name).toBe('Competition');
    });

    it('fails if the countdown organizationId is different from the organizations organizationId', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        head,
        organization,
        'FHE',
        new Date('2025-04-26')
      );
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

      await expect(
        BayDashboardAdminService.editBayDashboardCountdown(otherHead, countdown.bayDashboardCountdownId, otherOrganization, 'FHE', new Date('2025-04-26'))
      ).rejects.toThrow(new InvalidOrganizationException('Bay Dashboard Countdown'));
    });
  });
});
