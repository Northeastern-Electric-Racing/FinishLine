import { Organization } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { NotFoundException } from '../../src/utils/errors.utils';
import { sendNotificationToUsers } from '../../src/utils/homepage-notifications.utils';
import prisma from '../../src/prisma/prisma';

describe('Notification Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Send Notification', () => {
    it('fails on invalid user id', async () => {
      await expect(async () => await sendNotificationToUsers(['1'], 'test', 'test', orgId)).rejects.toThrow(
        new NotFoundException('User', '1')
      );
    });

    it('Succeeds and sends notification to user', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testWonderWoman = await createTestUser(wonderwomanGuest, orgId);

      const notification = await sendNotificationToUsers([testBatman.userId, testWonderWoman.userId], 'test', 'icon', orgId);

      const batmanWithNotifications = await prisma.user.findUnique({
        where: { userId: testBatman.userId },
        include: { unreadNotifications: true }
      });
      const wonderWomanWithNotifications = await prisma.user.findUnique({
        where: { userId: testWonderWoman.userId },
        include: { unreadNotifications: true }
      });

      expect(batmanWithNotifications?.unreadNotifications).toHaveLength(1);
      expect(batmanWithNotifications?.unreadNotifications[0]).toStrictEqual(notification);

      expect(wonderWomanWithNotifications?.unreadNotifications).toHaveLength(1);
      expect(wonderWomanWithNotifications?.unreadNotifications[0]).toStrictEqual(notification);
    });
  });
});
