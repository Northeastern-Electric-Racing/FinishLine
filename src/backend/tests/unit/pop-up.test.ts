import { Organization } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, supermanAdmin } from '../test-data/users.test-data';
import { NotFoundException } from '../../src/utils/errors.utils';
import prisma from '../../src/prisma/prisma';
import { PopUpService } from '../../src/services/pop-up.services';

describe('Pop Ups Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Send Pop Up', () => {
    it('fails on invalid user id', async () => {
      await expect(
        async () => await PopUpService.sendPopUpToUsers('test pop up', 'star', ['1', '2'], organization.organizationId)
      ).rejects.toThrow(new NotFoundException('User', '1'));
    });

    it('Succeeds and sends pop up to user', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      await PopUpService.sendPopUpToUsers(
        'test pop up',
        'star',
        [testBatman.userId, testSuperman.userId],
        organization.organizationId
      );

      const batmanWithPopUps = await prisma.user.findUnique({
        where: { userId: testBatman.userId },
        include: { unreadPopUps: true }
      });

      const supermanWithPopUps = await prisma.user.findUnique({
        where: { userId: testBatman.userId },
        include: { unreadPopUps: true }
      });

      expect(batmanWithPopUps?.unreadPopUps).toHaveLength(1);
      expect(batmanWithPopUps?.unreadPopUps[0].text).toBe('test pop up');
      expect(supermanWithPopUps?.unreadPopUps).toHaveLength(1);
      expect(supermanWithPopUps?.unreadPopUps[0].text).toBe('test pop up');
    });
  });

  describe('Get Notifications', () => {
    it('Succeeds and gets user pop ups', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await PopUpService.sendPopUpToUsers('test1', 'test1', [testBatman.userId], orgId);
      await PopUpService.sendPopUpToUsers('test2', 'test2', [testBatman.userId], orgId);

      const popUps = await PopUpService.getUserUnreadPopUps(testBatman.userId, organization.organizationId);

      expect(popUps).toHaveLength(2);
      expect(popUps[0].text).toBe('test1');
      expect(popUps[1].text).toBe('test2');
    });
  });

  describe('Remove Pop Ups', () => {
    it('Succeeds and removes user pop up', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await PopUpService.sendPopUpToUsers('test1', 'test1', [testBatman.userId], orgId);
      await PopUpService.sendPopUpToUsers('test2', 'test2', [testBatman.userId], orgId);

      const popUps = await PopUpService.getUserUnreadPopUps(testBatman.userId, organization.organizationId);

      expect(popUps).toHaveLength(2);
      expect(popUps[0].text).toBe('test1');
      expect(popUps[1].text).toBe('test2');

      const updatedPopUps = await PopUpService.removeUserPopUp(
        testBatman.userId,
        popUps[0].popUpId,
        organization.organizationId
      );

      expect(updatedPopUps).toHaveLength(1);
      expect(updatedPopUps[0].text).toBe('test2');
    });
  });
});
