import { Organization } from '@prisma/client';
import ShopServices from '../../src/services/shop.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';

describe('Shop Tests', () => {
  let organization: Organization;
  let orgId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('create shop', () => {
    it('fails if user is not an admin', async () => {
      await expect(
        ShopServices.createShop(await createTestUser(wonderwomanGuest, orgId), 'Non-Admin Shop', 'desc', organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create shop'));
    });

    it('succeeds for admin', async () => {
      const admin = await createTestUser(supermanAdmin, orgId);
      const result = await ShopServices.createShop(admin, 'Demo Shop', 'A seeded demo shop', organization);

      expect(result.name).toBe('Demo Shop');
      expect(result.description).toBe('A seeded demo shop');
      expect(result.userCreatedId).toBe(admin.userId);
    });

    it('fails on duplicate name', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      await ShopServices.createShop(admin, 'UniqueName', 'first', organization);

      await expect(ShopServices.createShop(admin, 'UniqueName', 'second attempt', organization)).rejects.toBeTruthy();
    });
  });
});
