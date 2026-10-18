import { Organization, Reimbursement_Status_Type, User } from '@prisma/client';
import FinanceServices from '../../src/services/finance.services.js';
import ReimbursementRequestService from '../../src/services/reimbursement-requests.services.js';
import { AccessDeniedException, DeletedException, NotFoundException } from '../../src/utils/errors.utils.js';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';

const TEST_EMAIL = 'test@test.com';

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
            ['MONETARY'],
            new Date(12, 1, 24),
            [2024, 2025],
            sponsorTierId,
            true,
            'Bill Gates',
            [],
            organization,
            5000,
            'googlecode',
            undefined,
            TEST_EMAIL
          )
      ).rejects.toThrow(new AccessDeniedException('Only heads can create a sponsor'));
    });

    it('Succeeds and creates a sponsor', async () => {
      const result = await FinanceServices.createSponsor(
        await createTestUser(batmanAppAdmin, orgId),
        'Google',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
      );

      expect(result.name).toEqual('Google');
      expect(result.activeStatus).toBe(true);
      expect(result.sponsorValue).toBe(5000);
      expect(result.joinDate).toEqual(new Date(12, 1, 24));
      expect(result.activeYears).toEqual([2024, 2025]);
      expect(result.tier!.sponsorTierId).toEqual(sponsorTierId);
      expect(result.taxExempt).toBe(true);
      expect(result.discountCode).toEqual('googlecode');
      expect(result.contact.name).toEqual('Bill Gates');
      expect(result.sponsorTasks).toEqual([]);
    });
  });

  describe('Get All Sponsors', () => {
    it('Succeeds and gets all the sponsors', async () => {
      const spon1 = await FinanceServices.createSponsor(
        await createTestUser(batmanAppAdmin, orgId),
        'Google',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
      );
      const spon2 = await FinanceServices.createSponsor(
        await createTestUser(supermanAdmin, orgId),
        'Apple',
        true,
        ['MONETARY'],
        new Date(11, 23, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Tim Cook',
        [],
        organization,
        2000,
        'applecode',
        undefined,
        TEST_EMAIL
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
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
      );

      const deletedSponsor = await FinanceServices.deleteSponsor(
        sponsor.sponsorId,
        await createTestUser(batmanAppAdmin, orgId),
        organization
      );

      expect(deletedSponsor).not.toBe(null);
      expect(deletedSponsor).toMatchObject({
        ...deletedSponsor,
        dateDeleted: expect.any(Date)
      });
    });
    it('Delete fails if user is not head or above', async () => {
      const sponsor = await FinanceServices.createSponsor(
        await createTestUser(supermanAdmin, orgId),
        'Google',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
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
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
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
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
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
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
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
      ).rejects.toThrow(new AccessDeniedException('Only finance team members or heads can edit sponsor tasks'));
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
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
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
            '#C0C0C0',
            0
          )
      ).rejects.toThrow(new AccessDeniedException('Only heads can create a sponsor tier'));
    });

    it('Succeeds and creates a sponsor tier', async () => {
      const result = await FinanceServices.createSponsorTier(
        await createTestUser(batmanAppAdmin, orgId),
        'Silver',
        organization,
        '#C0C0C0',
        0
      );

      expect(result.name).toEqual('Silver');
      expect(result.colorHexCode).toEqual('#C0C0C0');
    });
  });

  describe('Get Sponsor Tasks', () => {
    it('Succeeds and gets the sponsor tasks from a sponsor', async () => {
      const sponsor = await FinanceServices.createSponsor(
        await createTestUser(batmanAppAdmin, orgId),
        'Google',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [
          {
            dueDate: new Date(12, 1, 24),
            notifyDate: undefined,
            assigneeUserId: undefined,
            notes: 'uhh nothing'
          },
          {
            dueDate: new Date(12, 1, 24),
            notifyDate: undefined,
            assigneeUserId: undefined,
            notes: 'probably nothing again'
          }
        ],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
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
      ).rejects.toThrow(new AccessDeniedException('Only finance team members or heads can create a sponsor task'));
    });

    it('Fails when assigned user is not found', async () => {
      const user = await createTestUser(supermanAdmin, orgId);
      const newSponsor = await FinanceServices.createSponsor(
        user,
        'Telsa',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'telsaCode',
        undefined,
        TEST_EMAIL
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
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'telsaCode',
        undefined,
        TEST_EMAIL
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

      await FinanceServices.createSponsorTier(
        await createTestUser(batmanAppAdmin, orgId),
        'Silver',
        organization,
        '#C0C0C0',
        0
      );

      const result2 = await FinanceServices.getAllSponsorTiers(organization);
      expect(result2.length).toEqual(2);
      expect(result2[0].name).toEqual('Gold Tier');
      expect(result2[0].colorHexCode).toEqual('#FFFFFF');
      expect(result2[1].name).toEqual('Silver');
      expect(result2[1].colorHexCode).toEqual('#C0C0C0');
    });
  });

  describe('Edit Sponsor', () => {
    it('Successfully edits sponsor', async () => {
      const user = await createTestUser(batmanAppAdmin, orgId);
      const oldSponsor = await FinanceServices.createSponsor(
        user,
        'Google',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
      );

      const updatedSponsor = await FinanceServices.editSponsor(
        user,
        organization,
        oldSponsor.sponsorId,
        'newName',
        false,
        ['MONETARY'],
        new Date(5, 11, 25),
        [2024, 2025],
        sponsorTierId,
        'New Vendor Contact',
        false,
        [],
        4000,
        'New Discount code',
        undefined,
        TEST_EMAIL
      );

      expect(updatedSponsor.name).toBe('newName');
      expect(updatedSponsor.activeStatus).toBe(false);
      expect(updatedSponsor.sponsorValue).toBe(4000);
      expect(updatedSponsor.joinDate).toEqual(new Date(5, 11, 25));
      expect(updatedSponsor.activeYears).toEqual([2024, 2025]);
      expect(updatedSponsor.tier!.sponsorTierId).toBe(sponsorTierId);
      expect(updatedSponsor.contact.name).toBe('New Vendor Contact');
      expect(updatedSponsor.taxExempt).toBe(false);
      expect(updatedSponsor.discountCode).toBe('New Discount code');
    });
    it('Edit sponsor fails when non head tries to edit', async () => {
      const user = await createTestUser(batmanAppAdmin, orgId);
      const nonHead = await createTestUser(theVisitorGuest, orgId);

      const oldSponsor = await FinanceServices.createSponsor(
        user,
        'Google',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
      );
      await expect(
        async () =>
          await FinanceServices.editSponsor(
            nonHead,
            organization,
            oldSponsor.sponsorId,
            'newName',
            false,
            ['MONETARY'],
            new Date(5, 11, 25),
            [2024, 2025],
            sponsorTierId,
            'New Vendor Contact',
            false,
            [],
            4000,
            undefined,
            undefined,
            TEST_EMAIL
          )
      ).rejects.toThrow(new AccessDeniedException('Only heads can edit sponsors.'));
    });
    it('Edit sponsor fails with bad sponsorId', async () => {
      await expect(
        async () =>
          await FinanceServices.editSponsor(
            await createTestUser(batmanAppAdmin, orgId),
            organization,
            'badId',
            'newName',
            false,
            ['MONETARY'],
            new Date(5, 11, 25),
            [2024, 2025],
            sponsorTierId,
            'New Vendor Contact',
            false,
            [],
            4000,
            undefined,
            undefined,
            TEST_EMAIL
          )
      ).rejects.toThrow(new NotFoundException('Sponsor', 'badId'));
    });
    it('Edit sponsor fails with bad sponsorTierId', async () => {
      const user = await createTestUser(batmanAppAdmin, orgId);
      const oldSponsor = await FinanceServices.createSponsor(
        user,
        'Google',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024, 2025],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'googlecode',
        undefined,
        TEST_EMAIL
      );
      await expect(
        async () =>
          await FinanceServices.editSponsor(
            user,
            organization,
            oldSponsor.sponsorId,
            'newName',
            false,
            ['MONETARY'],
            new Date(5, 11, 25),
            [2024, 2025],
            'badId',
            'New Vendor Contact',
            false,
            [],
            4000,
            undefined,
            undefined,
            TEST_EMAIL
          )
      ).rejects.toThrow(new NotFoundException('Sponsor Tier', 'badId'));
    });
  });

  describe('Test delete sponsor task', () => {
    it('Successful deletion', async () => {
      const user = await createTestUser(supermanAdmin, orgId);
      const sponsor = await FinanceServices.createSponsor(
        user,
        'Telsa',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'telsaCode',
        undefined,
        TEST_EMAIL
      );

      const sponsorTask = await FinanceServices.createSponsorTask(
        user,
        organization,
        new Date(1, 2, 3),
        'hello notes',
        sponsor.sponsorId,
        new Date(1, 2, 3),
        user.userId
      );

      const deletedSponsorTask = await FinanceServices.deleteSponsorTask(
        sponsorTask.sponsorTaskId,
        await createTestUser(batmanAppAdmin, orgId),
        organization
      );

      expect(deletedSponsorTask).not.toBe(null);
      expect(deletedSponsorTask.dateDeleted).not.toBe(null);
    });
    it('Delete fails if user is not head or above', async () => {
      const user = await createTestUser(supermanAdmin, orgId);
      const sponsor = await FinanceServices.createSponsor(
        user,
        'Telsa',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Bill Gates',
        [],
        organization,
        5000,
        'telsaCode',
        undefined,
        TEST_EMAIL
      );

      const sponsorTask = await FinanceServices.createSponsorTask(
        user,
        organization,
        new Date(1, 2, 3),
        'hello notes',
        sponsor.sponsorId,
        new Date(1, 2, 3),
        user.userId
      );

      await expect(async () =>
        FinanceServices.deleteSponsorTask(
          sponsorTask.sponsorTaskId,
          await createTestUser(theVisitorGuest, orgId),
          organization
        )
      ).rejects.toThrow(new AccessDeniedException('Only heads or the task assignee can delete sponsor tasks'));
    });
    it('Delete fails if given sponsor task cannot be found', async () => {
      await expect(async () =>
        FinanceServices.deleteSponsorTask('123', await createTestUser(supermanAdmin, orgId), organization)
      ).rejects.toThrow(new NotFoundException('SponsorTask', '123'));
    });
  });

  describe('Toggle Sponsor Task Done', () => {
    it('Succeeds and toggles done from false to true', async () => {
      const user = await createTestUser(supermanAdmin, orgId);
      const sponsor = await FinanceServices.createSponsor(
        user,
        'Tesla',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Elon Musk',
        [],
        organization,
        5000,
        undefined,
        undefined,
        TEST_EMAIL
      );

      const sponsorTask = await FinanceServices.createSponsorTask(
        user,
        organization,
        new Date(1, 2, 3),
        'Test task',
        sponsor.sponsorId
      );

      expect(sponsorTask.done).toBe(false);

      const toggledTask = await FinanceServices.toggleSponsorTaskDone(user, organization, sponsorTask.sponsorTaskId);

      expect(toggledTask.done).toBe(true);
    });

    it('Succeeds and toggles done from true to false', async () => {
      const user = await createTestUser(supermanAdmin, orgId);
      const sponsor = await FinanceServices.createSponsor(
        user,
        'Tesla',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Elon Musk',
        [],
        organization,
        5000,
        undefined,
        undefined,
        TEST_EMAIL
      );

      const sponsorTask = await FinanceServices.createSponsorTask(
        user,
        organization,
        new Date(1, 2, 3),
        'Test task',
        sponsor.sponsorId
      );

      // Toggle to true first
      await FinanceServices.toggleSponsorTaskDone(user, organization, sponsorTask.sponsorTaskId);

      // Toggle back to false
      const toggledTask = await FinanceServices.toggleSponsorTaskDone(user, organization, sponsorTask.sponsorTaskId);

      expect(toggledTask.done).toBe(false);
    });

    it('Fails if user is not a head', async () => {
      const head = await createTestUser(supermanAdmin, orgId);
      const guest = await createTestUser(theVisitorGuest, orgId);

      const sponsor = await FinanceServices.createSponsor(
        head,
        'Tesla',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Elon Musk',
        [],
        organization,
        5000,
        undefined,
        undefined,
        TEST_EMAIL
      );

      const sponsorTask = await FinanceServices.createSponsorTask(
        head,
        organization,
        new Date(1, 2, 3),
        'Test task',
        sponsor.sponsorId
      );

      await expect(FinanceServices.toggleSponsorTaskDone(guest, organization, sponsorTask.sponsorTaskId)).rejects.toThrow(
        new AccessDeniedException('Only finance team members, heads, or the task assignee can toggle task status')
      );
    });

    it('Fails if sponsor task does not exist', async () => {
      const user = await createTestUser(supermanAdmin, orgId);

      await expect(FinanceServices.toggleSponsorTaskDone(user, organization, 'nonexistent-id')).rejects.toThrow(
        new NotFoundException('SponsorTask', 'nonexistent-id')
      );
    });

    it('Fails if sponsor task is deleted', async () => {
      const user = await createTestUser(supermanAdmin, orgId);
      const sponsor = await FinanceServices.createSponsor(
        user,
        'Tesla',
        true,
        ['MONETARY'],
        new Date(12, 1, 24),
        [2024],
        sponsorTierId,
        true,
        'Elon Musk',
        [],
        organization,
        5000,
        undefined,
        undefined,
        TEST_EMAIL
      );

      const sponsorTask = await FinanceServices.createSponsorTask(
        user,
        organization,
        new Date(1, 2, 3),
        'Test task',
        sponsor.sponsorId
      );

      await FinanceServices.deleteSponsorTask(sponsorTask.sponsorTaskId, user, organization);

      await expect(FinanceServices.toggleSponsorTaskDone(user, organization, sponsorTask.sponsorTaskId)).rejects.toThrow(
        new NotFoundException('SponsorTask', sponsorTask.sponsorTaskId)
      );
    });
  });

  describe('Category spending data cents to dollars conversion', () => {
    let user: User;
    let vendorId: string;
    let indexCodeId: string;
    let accountCodeId: string;
    let rrIdentifier: number;

    beforeEach(async () => {
      user = await createTestUser(batmanAppAdmin, orgId);
      const vendor = await ReimbursementRequestService.createVendor(user, 'Tesla', organization, true, [user.userId]);
      ({ vendorId } = vendor);
      ({ indexCodeId } = await ReimbursementRequestService.createIndexCode('CASH', '830667', user, organization));
      ({ accountCodeId } = await ReimbursementRequestService.createAccountCode(
        user,
        'Equipment',
        123,
        true,
        [indexCodeId],
        organization
      ));
      rrIdentifier = 1;
    });

    // budget is stored in cents, matching what the admin category form saves
    const createCategory = async (name: string, budgetInCents: number) =>
      ReimbursementRequestService.createOtherReasonReimbursementProduct(
        name,
        budgetInCents,
        indexCodeId,
        [accountCodeId],
        user,
        organization
      );

    // product costs are stored in cents
    const createCategoryRR = async (otherReasonId: string, costInCents: number, status: Reimbursement_Status_Type) =>
      prisma.reimbursement_Request.create({
        data: {
          identifier: rrIdentifier++,
          recipientId: user.userId,
          vendorId,
          indexCodeId,
          accountCodeId,
          organizationId: orgId,
          totalCost: costInCents,
          reimbursementStatuses: { create: { type: status, userId: user.userId } },
          reimbursementProducts: {
            create: {
              name: 'Glue',
              cost: costInCents,
              reimbursementProductReason: { create: { otherReasonId } }
            }
          }
        }
      });

    it('Converts the category budget from cents to dollars when there is no spending', async () => {
      const category = await createCategory('General Tools', 500000);

      const result = await FinanceServices.getReimbursementRequestCategoryData(category.otherProductReasonId, organization);

      expect(result).toStrictEqual({
        totalBudget: 5000,
        approved: 0,
        pendingApproval: 0,
        addedToSabo: 0,
        reimbursed: 0,
        available: 5000
      });
    });

    it('Converts the budget and every spending status from cents to dollars', async () => {
      const category = await createCategory('General Tools', 500000);
      const { otherProductReasonId } = category;

      await createCategoryRR(otherProductReasonId, 10050, Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL);
      await createCategoryRR(otherProductReasonId, 20000, Reimbursement_Status_Type.LEADERSHIP_APPROVED);
      await createCategoryRR(otherProductReasonId, 30025, Reimbursement_Status_Type.SABO_SUBMITTED);
      await createCategoryRR(otherProductReasonId, 40000, Reimbursement_Status_Type.REIMBURSED);

      const result = await FinanceServices.getReimbursementRequestCategoryData(otherProductReasonId, organization);

      expect(result).toStrictEqual({
        totalBudget: 5000,
        pendingApproval: 100.5,
        approved: 200,
        addedToSabo: 300.25,
        reimbursed: 400,
        available: 5000 - 100.5 - 200 - 300.25 - 400
      });
    });

    it('Ignores denied requests when converting spending', async () => {
      const category = await createCategory('General Tools', 500000);
      await createCategoryRR(category.otherProductReasonId, 100000, Reimbursement_Status_Type.DENIED);

      const result = await FinanceServices.getReimbursementRequestCategoryData(category.otherProductReasonId, organization);

      expect(result.totalBudget).toBe(5000);
      expect(result.available).toBe(5000);
    });

    it('Reports a negative available amount in dollars when overbudget', async () => {
      const category = await createCategory('General Tools', 10000);
      await createCategoryRR(category.otherProductReasonId, 15000, Reimbursement_Status_Type.REIMBURSED);

      const result = await FinanceServices.getReimbursementRequestCategoryData(category.otherProductReasonId, organization);

      expect(result.totalBudget).toBe(100);
      expect(result.reimbursed).toBe(150);
      expect(result.available).toBe(-50);
    });

    it('Returns dollar amounts for every category in the spending bar data', async () => {
      const tools = await createCategory('General Tools', 500000);
      const competition = await createCategory('Competition', 150000);
      await createCategoryRR(competition.otherProductReasonId, 2500, Reimbursement_Status_Type.REIMBURSED);

      const result = await FinanceServices.getSpendingBarCategoryData(organization);

      expect(result.title).toBe('Club Categories');
      expect(result.data).toHaveLength(2);

      const toolsData = result.data.find((d) => d.title === tools.name);
      const competitionData = result.data.find((d) => d.title === competition.name);

      expect(toolsData?.spendingInfo.totalBudget).toBe(5000);
      expect(toolsData?.spendingInfo.available).toBe(5000);
      expect(competitionData?.spendingInfo.totalBudget).toBe(1500);
      expect(competitionData?.spendingInfo.reimbursed).toBe(25);
      expect(competitionData?.spendingInfo.available).toBe(1475);
    });
  });
});
