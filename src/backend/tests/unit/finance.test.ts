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
      expect(result.tierId).toEqual(sponsorTierId);
      expect(result.taxExempt).toBe(true);
      expect(result.discountCode).toEqual('googlecode');
      expect(result.vendorContact).toEqual('Bill Gates');
      expect(result.sponsorTasks).toEqual([]);
    });
  });

  describe('Get All Sponsors', () => {
    it('Succeeds and gets all the sponsors', async () => {
      const spon1 = await FinanceServices.createSponsor(
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
      const spon2 = await FinanceServices.createSponsor(
        await createTestUser(supermanAdmin, orgId),
        'Apple',
        true,
        2000,
        new Date(11, 23, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Tim Cook',
        [],
        organization,
        'applecode'
      );
      const result = await FinanceServices.getAllSponsors(organization);
      expect(result).toStrictEqual([spon1, spon2]);
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
  describe('Edit a sponsor task works', () => {
    it('Successful edit', async () => {
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

      const oldSponsorTask = await prisma.sponsor_Task.create({
        data: {
          dueDate: new Date(12, 1, 24),
          notes: 'abc',
          sponsorId: sponsor.sponsorId
        }
      });

      const user = await createTestUser(wonderwomanGuest, orgId);

      const newSponsorTask = await FinanceServices.editSponsorTask(
        oldSponsorTask.sponsorTaskId,
        new Date(12, 10, 24),
        'newNotes',
        new Date(12, 20, 24),
        user.userId
      );

      expect(newSponsorTask.notes).toEqual('newNotes');
      expect(newSponsorTask.dueDate).toEqual(new Date(12, 10, 24));
      expect(newSponsorTask.notifyDate).toEqual(new Date(12, 20, 24));
      expect(newSponsorTask.assigneeUserId).toEqual(user.userId);
    });
    it('Edit fails if sponsor task does not exist', async () => {
      await expect(
        async () => await FinanceServices.editSponsorTask('bad id', new Date(12, 10, 24), 'newNotes', new Date(12, 20, 24))
      ).rejects.toThrow(new NotFoundException('SponsorTask', 'bad id'));
    });
    it('Edit fails if nonexistent assignee id is given', async () => {
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

      const oldSponsorTask = await prisma.sponsor_Task.create({
        data: {
          dueDate: new Date(12, 1, 24),
          notes: 'abc',
          sponsorId: sponsor.sponsorId
        }
      });

      await expect(
        async () =>
          await FinanceServices.editSponsorTask(
            oldSponsorTask.sponsorTaskId,
            new Date(12, 10, 24),
            'newNotes',
            new Date(12, 20, 24),
            'bad user id'
          )
      ).rejects.toThrow(new NotFoundException('User', 'bad user id'));
    });
  });
  describe('Create a sponsor tier', () => {
    it('Fails if user is not a head', async () => {
      await expect(
        async () =>
          await FinanceServices.createSponsorTier(
            await createTestUser(wonderwomanGuest, orgId),
            'Silver',
            organization,
            'C0C0C0'
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a sponsor tier'));
    });

    it('Succeeds and creates a sponsor tier', async () => {
      const result = await FinanceServices.createSponsorTier(
        await createTestUser(batmanAppAdmin, orgId),
        'Silver',
        organization,
        'C0C0C0'
      );

      expect(result.name).toEqual('Silver');
      expect(result.colorHexCode).toEqual('C0C0C0');
      expect(result.organizationId).toEqual(orgId);
    });
  });
});
