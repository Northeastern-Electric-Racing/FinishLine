import { Organization } from '@prisma/client';
import FinanceServices from '../../src/services/finance.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';

describe('Finance Tests', () => {
  let orgId: string;
  let organization: Organization;
  let sponsorTierId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    const sponsorTier = await prisma.sponsor_Tier.create({
      data: {
        name: 'Gold Tier',
        colorHexCode: '#FFFFFF',
        organizationId: orgId
      }
    });
    ({ sponsorTierId } = sponsorTier);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create a sponsor', () => {
    it('Fails if user is not a head', async () => {
      await expect(
        async () =>
          await FinanceServices.createSponsor(
            await createTestUser(wonderwomanGuest, orgId),
            'Google',
            true,
            5000,
            new Date(12, 1, 24),
            [2024, 2025],
            sponsorTierId,
            true,
            'googlecode',
            'Bill Gates',
            [],
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a sponsor'));
    });

    it('Succeeds and creates a sponsor', async () => {
      const result = await FinanceServices.createSponsor(
        await createTestUser(batmanAppAdmin, orgId),
        'Google',
        true,
        5000,
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'googlecode',
        'Bill Gates',
        [],
        organization
      );

      expect(result.name).toEqual('Google');
      expect(result.activeStatus).toBe(true);
      expect(result.sponsorValue).toBe(5000);
      expect(result.joinDate).toEqual(new Date(12, 1, 24));
      expect(result.activeYears).toEqual([2024, 2025]);
      expect(result.sponsorTierId).toEqual(sponsorTierId);
      expect(result.taxExempt).toBe(true);
      expect(result.discountCode).toEqual('googlecode');
      expect(result.vendorContact).toEqual('Bill Gates');
      expect(result.sponsorTasks).toEqual([]);
      expect(result.organizationId).toEqual(orgId);
    });
  });
});
