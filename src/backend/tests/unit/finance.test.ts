import { Organization } from '@prisma/client';
import FinanceServices from '../../src/services/finance.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  NotFoundException
} from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data';
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
            'Bill Gates',
            [],
            organization,
            'googlecode'
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
        'Bill Gates',
        [],
        organization,
        'googlecode'
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
  describe('Delete a sponsor works', () => {
    it('Successful deletion', async () => {
      const sponsor = await FinanceServices.createSponsor(
        await createTestUser(supermanAdmin, orgId),
        'Google',
        true,
        5000,
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        'googlecode'
      );

      const deletedSponsor = await FinanceServices.deleteSponsor(
        sponsor.sponsorId,
        await createTestUser(batmanAppAdmin, orgId),
        organization
      );

      expect(deletedSponsor).not.toBe(null);
      expect(deletedSponsor?.dateDeleted).not.toBe(null);
    });
    it('Delete fails if user is not head or above', async () => {
      const sponsor = await FinanceServices.createSponsor(
        await createTestUser(supermanAdmin, orgId),
        'Google',
        true,
        5000,
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        'googlecode'
      );

      await expect(async () =>
        FinanceServices.deleteSponsor(sponsor.sponsorId, await createTestUser(theVisitorGuest, orgId), organization)
      ).rejects.toThrow(new AccessDeniedException('Only heads can delete sponsors.'));
    });
    it('Delete fails if given sponsor cannot be found', async () => {
      await expect(async () =>
        FinanceServices.deleteSponsor('badsponsorid', await createTestUser(supermanAdmin, orgId), organization)
      ).rejects.toThrow(new NotFoundException('Sponsor', 'badsponsorid'));
    });
    it('Delete fails sponsor has already been deleted', async () => {
      const user = await createTestUser(supermanAdmin, orgId);
      const sponsor = await FinanceServices.createSponsor(
        user,
        'Google',
        true,
        5000,
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        'googlecode'
      );

      await FinanceServices.deleteSponsor(sponsor.sponsorId, user, organization);

      await expect(async () => FinanceServices.deleteSponsor(sponsor.sponsorId, user, organization)).rejects.toThrow(
        new DeletedException('Sponsor', sponsor.sponsorId)
      );
    });
  });

  describe('Get Sponsor Tasks', () => {
    it('Succeeds and gets the sponsor tasks from a sponsor', async () => {
      const sponsor = await FinanceServices.createSponsor(
        await createTestUser(batmanAppAdmin, orgId),
        'Google',
        true,
        5000,
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [
          {
            sponsorId: '1',
            sponsorTaskId: '2',
            dueDate: new Date(12, 1, 24),
            notifyDate: null,
            assigneeUserId: null,
            notes: 'uhh nothing'
          },
          {
            sponsorId: '11',
            sponsorTaskId: '22',
            dueDate: new Date(12, 1, 24),
            notifyDate: null,
            assigneeUserId: null,
            notes: 'probably nothing again'
          }
        ],
        organization,
        'googlecode'
      );

      const sponsorTasks = await FinanceServices.getSponsorTasks(sponsor.sponsorId, organization.organizationId);

      expect(sponsorTasks).toHaveLength(2);
      expect(sponsorTasks[0].notes).toBe('uhh nothing');
      expect(sponsorTasks[1].notes).toBe('probably nothing again');

      await expect(async () => FinanceServices.getSponsorTasks('21', organization.organizationId)).rejects.toThrow(
        new NotFoundException('Sponsor', sponsor.sponsorId)
      );

      await prisma.sponsor_Task.deleteMany();
    });
  });
});
