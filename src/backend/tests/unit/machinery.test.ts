import { Organization } from '@prisma/client';
import MachineryService from '../../src/services/machinery.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';

describe('Machinery Tests', () => {
  let orgId: string;
  let organization: Organization;
  let shopId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;

    // Create a test shop for shopId, assuming prisma create shop works
    const shopName = 'Precision Manufacturing Lab';
    const shop = await prisma.shop.create({
      data: {
        name: shopName,
        description: 'Manufacturing facility equipped with advanced machinery and tools for engineering',
        userCreatedId: (await createTestUser(batmanAppAdmin, orgId)).userId
      }
    });
    ({ shopId } = shop);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create machinery', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () =>
          await MachineryService.createMachinery(
            await createTestUser(wonderwomanGuest, orgId),
            'Captain America Shield Press',
            shopId,
            1,
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create machinery'));
    });

    it('Succeeds and creates machinery', async () => {
      const result = await MachineryService.createMachinery(
        await createTestUser(supermanAdmin, orgId),
        'Iron Man Mark 42 CNC Mill',
        shopId,
        2,
        organization
      );

      expect(result.name).toEqual('Iron Man Mark 42 CNC Mill');
      expect(result.shops).toHaveLength(1);
      expect(result.shops[0].quantity).toBe(2);
      expect(result.shops[0].shopId).toBe(shopId);
    });
  });
});
