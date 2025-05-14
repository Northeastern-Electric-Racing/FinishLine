import { Organization } from '@prisma/client';
import FinanceServices from '../../src/services/finance.services';
import { AccessDeniedException, DeletedException, NotFoundException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { Sponsor } from 'shared';

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
      ).rejects.toThrow(new AccessDeniedException('Only heads can create a sponsor'));
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
      expect(result.tier.sponsorTierId).toEqual(sponsorTierId);
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
        await await createTestUser(batmanAppAdmin, orgId),
        organization,
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
    it('Edit fails with non head user trying to edit', async () => {
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

      await expect(
        async () =>
          await FinanceServices.editSponsorTask(
            await createTestUser(wonderwomanGuest, orgId),
            organization,
            sponsor.sponsorId,
            new Date(12, 10, 24),
            'newNotes',
            new Date(12, 20, 24)
          )
      ).rejects.toThrow(new AccessDeniedException('Only heads can edit sponsor tasks.'));
    });
    it('Edit fails if sponsor task does not exist', async () => {
      await expect(
        async () =>
          await FinanceServices.editSponsorTask(
            await await createTestUser(batmanAppAdmin, orgId),
            organization,
            'bad id',
            new Date(12, 10, 24),
            'newNotes',
            new Date(12, 20, 24)
          )
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
            await createTestUser(batmanAppAdmin, orgId),
            organization,
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
      ).rejects.toThrow(new AccessDeniedException('Only heads can create a sponsor tier'));
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
        new NotFoundException('Sponsor', '21')
      );

      await prisma.sponsor_Task.deleteMany();
    });
  });

  describe('Create Sponsor Tasks', () => {
    it('Fails when user is not a head or above', async () => {
      const user = await createTestUser(wonderwomanGuest, orgId);
      await expect(
        FinanceServices.createSponsorTask(user, organization, new Date(1, 1, 25), 'notes', 'sponsorId')
      ).rejects.toThrow(new AccessDeniedException('Only heads can create a sponsor task'));
    });

    it('Fails when assigned user is not found', async () => {
      const user = await createTestUser(supermanAdmin, orgId);
      const newSponsor = await FinanceServices.createSponsor(
        user,
        'Telsa',
        true,
        5000,
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        'telsaCode'
      );

      await expect(
        FinanceServices.createSponsorTask(
          user,
          organization,
          new Date(1, 2, 3),
          'hello notes',
          newSponsor.sponsorId,
          new Date(1, 2, 3),
          'USERID'
        )
      ).rejects.toThrow(new NotFoundException('User', 'USERID'));
    });

    it('Fails when associated sponsor is not found', async () => {
      const user = await createTestUser(supermanAdmin, orgId);

      await expect(
        FinanceServices.createSponsorTask(user, organization, new Date(1, 2, 3), 'hello notes', 'NOT FOUND')
      ).rejects.toThrow(new NotFoundException('Sponsor', 'NOT FOUND'));
    });

    it('Succeeds in creating a sponsor task', async () => {
      const user = await createTestUser(supermanAdmin, orgId);
      const sponsor = await FinanceServices.createSponsor(
        user,
        'Telsa',
        true,
        5000,
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        'telsaCode'
      );

      const result = await FinanceServices.createSponsorTask(
        user,
        organization,
        new Date(1, 2, 3),
        'hello notes',
        sponsor.sponsorId,
        new Date(1, 2, 3),
        user.userId
      );

      expect(result.assignee?.userId).toEqual(user.userId);
      expect(result.notes).toEqual('hello notes');
      expect(result.dueDate).toEqual(new Date(1, 2, 3));
      expect(result.assignee?.userId).toEqual(user.userId);
    });
  });

  describe('Get all sponsor tiers', () => {
    it('Successfully gets all sponsor tiers', async () => {
      const result = await FinanceServices.getAllSponsorTiers(organization);
      expect(result.length).toEqual(1);
      expect(result[0].name).toEqual('Gold Tier');
      expect(result[0].colorHexCode).toEqual('#FFFFFF');
    });
    it('Successfully gets all sponsor tiers after adding new tier', async () => {
      const result1 = await FinanceServices.getAllSponsorTiers(organization);
      expect(result1.length).toEqual(1);

      await FinanceServices.createSponsorTier(await createTestUser(batmanAppAdmin, orgId), 'Silver', organization, 'C0C0C0');

      const result2 = await FinanceServices.getAllSponsorTiers(organization);
      expect(result2.length).toEqual(2);
      expect(result2[0].name).toEqual('Gold Tier');
      expect(result2[0].colorHexCode).toEqual('#FFFFFF');
      expect(result2[1].name).toEqual('Silver');
      expect(result2[1].colorHexCode).toEqual('C0C0C0');
    });
  });

  describe('Edit Sponsor', () => {
    it('Successfully edits sponsor', async () => {
      const user = await createTestUser(batmanAppAdmin, orgId);
      const oldSponsor = await FinanceServices.createSponsor(
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

      const updatedSponsor = await FinanceServices.editSponsor(
        user,
        organization,
        oldSponsor.sponsorId,
        'newName',
        false,
        4000,
        new Date(5, 11, 25),
        [2024, 2025],
        sponsorTierId,
        'New Vendor Contact',
        false,
        [],
        'New Discount code'
      );

      expect(updatedSponsor.name).toBe('newName');
      expect(updatedSponsor.activeStatus).toBe(false);
      expect(updatedSponsor.sponsorValue).toBe(4000);
      expect(updatedSponsor.joinDate).toEqual(new Date(5, 11, 25));
      expect(updatedSponsor.activeYears).toEqual([2024, 2025]);
      expect(updatedSponsor.tier.sponsorTierId).toBe(sponsorTierId);
      expect(updatedSponsor.vendorContact).toBe('New Vendor Contact');
      expect(updatedSponsor.taxExempt).toBe(false);
      expect(updatedSponsor.discountCode).toBe('New Discount code');
    });
  });
});
