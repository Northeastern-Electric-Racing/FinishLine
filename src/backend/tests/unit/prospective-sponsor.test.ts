import { Organization } from '@prisma/client';
import ProspectiveSponsorServices from '../../src/services/prospective-sponsor.services.js';
import FinanceServices from '../../src/services/finance.services.js';
import { AccessDeniedException, DeletedException, HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin } from '../test-data/users.test-data.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import { FirstContactMethod, ProspectiveSponsorStatus } from 'shared';

describe('Prospective Sponsor Tests', () => {
  let orgId: string;
  let organization: Organization;
  let sponsorTierId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    const sponsorTier = await prisma.sponsor_Tier.create({
      data: {
        name: 'Gold Tier',
        colorHexCode: '#FFD700',
        organizationId: orgId
      }
    });
    ({ sponsorTierId } = sponsorTier);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Prospective Sponsor', () => {
    it('Fails if user is not on finance team or a head', async () => {
      const guest = await createTestUser(wonderwomanGuest, orgId);
      const contactor = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        ProspectiveSponsorServices.createProspectiveSponsor(
          guest,
          organization,
          'Acme Corp',
          new Date(),
          FirstContactMethod.INBOUND_EMAIL,
          'John Doe',
          contactor.userId,
          undefined,
          'contact@test.com'
        )
      ).rejects.toThrow(new AccessDeniedException('Only finance team members or heads can create prospective sponsors'));
    });

    it('Fails if neither email nor phone is provided', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        ProspectiveSponsorServices.createProspectiveSponsor(
          head,
          organization,
          'Acme Corp',
          new Date(),
          FirstContactMethod.INBOUND_EMAIL,
          'John Doe',
          head.userId
        )
      ).rejects.toThrow(new HttpException(400, 'At least one of contact email or contact phone is required'));
    });

    it('Succeeds with only email', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const result = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Email Only Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'john@email.com'
      );

      expect(result.contact.email).toBe('john@email.com');
      expect(result.contact.phone).toBeUndefined();
    });

    it('Succeeds with only phone', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const result = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Phone Only Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        undefined,
        '555-1234'
      );

      expect(result.contact.email).toBeUndefined();
      expect(result.contact.phone).toBe('555-1234');
    });

    it('Fails if prospective sponsor with same name already exists', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.createProspectiveSponsor(
          head,
          organization,
          'Acme Corp',
          new Date(),
          FirstContactMethod.OUTBOUND_EMAIL,
          'Jane Doe',
          head.userId,
          undefined,
          'jane@test.com'
        )
      ).rejects.toThrow(new HttpException(400, 'A prospective sponsor with the name "Acme Corp" already exists.'));
    });

    it('Fails if contactor user does not exist', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        ProspectiveSponsorServices.createProspectiveSponsor(
          head,
          organization,
          'Acme Corp',
          new Date(),
          FirstContactMethod.INBOUND_EMAIL,
          'John Doe',
          'nonexistent-user-id',
          undefined,
          'contact@test.com'
        )
      ).rejects.toThrow(new NotFoundException('User', 'nonexistent-user-id'));
    });

    it('Succeeds and creates a prospective sponsor', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);
      const lastContactDate = new Date(2024, 5, 15);

      const result = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        lastContactDate,
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        14,
        'john@acme.com',
        '555-1234',
        'CEO'
      );

      expect(result.organizationName).toBe('Acme Corp');
      expect(result.lastContactDate).toEqual(lastContactDate);
      expect(result.firstContactMethod).toBe(FirstContactMethod.INBOUND_EMAIL);
      expect(result.contact.name).toBe('John Doe');
      expect(result.contact.email).toBe('john@acme.com');
      expect(result.contact.phone).toBe('555-1234');
      expect(result.contact.position).toBe('CEO');
      expect(result.contactor.userId).toBe(head.userId);
      expect(result.highlightThresholdDays).toBe(14);
      expect(result.status).toBe(ProspectiveSponsorStatus.IN_PROGRESS);
      expect(result.tasks).toEqual([]);
    });

    it('Uses default highlight threshold of 10 days', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const result = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      expect(result.highlightThresholdDays).toBe(10);
    });
  });

  describe('Get All Prospective Sponsors', () => {
    it('Returns all prospective sponsors for organization', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps1 = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      const ps2 = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Beta Inc',
        new Date(),
        FirstContactMethod.OUTBOUND_EMAIL,
        'Jane Smith',
        head.userId,
        undefined,
        'jane@test.com'
      );

      const results = await ProspectiveSponsorServices.getAllProspectiveSponsors(organization);

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.prospectiveSponsorId)).toContain(ps1.prospectiveSponsorId);
      expect(results.map((r) => r.prospectiveSponsorId)).toContain(ps2.prospectiveSponsorId);
    });

    it('Does not return deleted prospective sponsors', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps1 = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Beta Inc',
        new Date(),
        FirstContactMethod.OUTBOUND_EMAIL,
        'Jane Smith',
        head.userId,
        undefined,
        'jane@test.com'
      );

      await ProspectiveSponsorServices.deleteProspectiveSponsor(ps1.prospectiveSponsorId, head, organization);

      const results = await ProspectiveSponsorServices.getAllProspectiveSponsors(organization);

      expect(results).toHaveLength(1);
      expect(results[0].organizationName).toBe('Beta Inc');
    });
  });

  describe('Edit Prospective Sponsor', () => {
    it('Fails if user is not on finance team or a head', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.editProspectiveSponsor(
          guest,
          organization,
          ps.prospectiveSponsorId,
          'Acme Corp Updated',
          new Date(),
          ProspectiveSponsorStatus.IN_PROGRESS,
          FirstContactMethod.INBOUND_EMAIL,
          'John Doe',
          head.userId,
          undefined,
          'contact@test.com'
        )
      ).rejects.toThrow(new AccessDeniedException('Only finance team members or heads can edit prospective sponsors'));
    });

    it('Fails if neither email nor phone is provided', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.editProspectiveSponsor(
          head,
          organization,
          ps.prospectiveSponsorId,
          'Acme Corp',
          new Date(),
          ProspectiveSponsorStatus.IN_PROGRESS,
          FirstContactMethod.INBOUND_EMAIL,
          'John Doe',
          head.userId
        )
      ).rejects.toThrow(new HttpException(400, 'At least one of contact email or contact phone is required'));
    });

    it('Fails if prospective sponsor does not exist', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        ProspectiveSponsorServices.editProspectiveSponsor(
          head,
          organization,
          'nonexistent-id',
          'Acme Corp',
          new Date(),
          ProspectiveSponsorStatus.IN_PROGRESS,
          FirstContactMethod.INBOUND_EMAIL,
          'John Doe',
          head.userId,
          undefined,
          'contact@test.com'
        )
      ).rejects.toThrow(new NotFoundException('ProspectiveSponsor', 'nonexistent-id'));
    });

    it('Fails if prospective sponsor is deleted', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await ProspectiveSponsorServices.deleteProspectiveSponsor(ps.prospectiveSponsorId, head, organization);

      await expect(
        ProspectiveSponsorServices.editProspectiveSponsor(
          head,
          organization,
          ps.prospectiveSponsorId,
          'Acme Corp Updated',
          new Date(),
          ProspectiveSponsorStatus.IN_PROGRESS,
          FirstContactMethod.INBOUND_EMAIL,
          'John Doe',
          head.userId,
          undefined,
          'contact@test.com'
        )
      ).rejects.toThrow(new DeletedException('ProspectiveSponsor', ps.prospectiveSponsorId));
    });

    it('Fails if new name already exists', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps1 = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Beta Inc',
        new Date(),
        FirstContactMethod.OUTBOUND_EMAIL,
        'Jane Smith',
        head.userId,
        undefined,
        'jane@test.com'
      );

      await expect(
        ProspectiveSponsorServices.editProspectiveSponsor(
          head,
          organization,
          ps1.prospectiveSponsorId,
          'Beta Inc',
          new Date(),
          ProspectiveSponsorStatus.IN_PROGRESS,
          FirstContactMethod.INBOUND_EMAIL,
          'John Doe',
          head.userId,
          undefined,
          'contact@test.com'
        )
      ).rejects.toThrow(new HttpException(400, 'A prospective sponsor with the name "Beta Inc" already exists.'));
    });

    it('Fails if contactor does not exist', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.editProspectiveSponsor(
          head,
          organization,
          ps.prospectiveSponsorId,
          'Acme Corp',
          new Date(),
          ProspectiveSponsorStatus.IN_PROGRESS,
          FirstContactMethod.INBOUND_EMAIL,
          'John Doe',
          'nonexistent-user-id',
          undefined,
          'contact@test.com'
        )
      ).rejects.toThrow(new NotFoundException('User', 'nonexistent-user-id'));
    });

    it('Succeeds and updates prospective sponsor', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);
      const newContactor = await createTestUser(supermanAdmin, orgId);
      const newLastContactDate = new Date(2024, 8, 20);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      const result = await ProspectiveSponsorServices.editProspectiveSponsor(
        head,
        organization,
        ps.prospectiveSponsorId,
        'Acme Corporation',
        newLastContactDate,
        ProspectiveSponsorStatus.NO_RESPONSE,
        FirstContactMethod.OUTBOUND_EMAIL,
        'Jane Smith',
        newContactor.userId,
        20,
        'jane@acme.com',
        '555-5678',
        'CFO'
      );

      expect(result.organizationName).toBe('Acme Corporation');
      expect(result.lastContactDate).toEqual(newLastContactDate);
      expect(result.status).toBe(ProspectiveSponsorStatus.NO_RESPONSE);
      expect(result.firstContactMethod).toBe(FirstContactMethod.OUTBOUND_EMAIL);
      expect(result.contact.name).toBe('Jane Smith');
      expect(result.contact.email).toBe('jane@acme.com');
      expect(result.contact.phone).toBe('555-5678');
      expect(result.contact.position).toBe('CFO');
      expect(result.contactor.userId).toBe(newContactor.userId);
      expect(result.highlightThresholdDays).toBe(20);
    });
  });

  describe('Delete Prospective Sponsor', () => {
    it('Fails if user is not a head', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.deleteProspectiveSponsor(ps.prospectiveSponsorId, guest, organization)
      ).rejects.toThrow(new AccessDeniedException('Only heads can delete prospective sponsors'));
    });

    it('Fails if prospective sponsor does not exist', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        ProspectiveSponsorServices.deleteProspectiveSponsor('nonexistent-id', head, organization)
      ).rejects.toThrow(new NotFoundException('ProspectiveSponsor', 'nonexistent-id'));
    });

    it('Fails if prospective sponsor is already deleted', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await ProspectiveSponsorServices.deleteProspectiveSponsor(ps.prospectiveSponsorId, head, organization);

      await expect(
        ProspectiveSponsorServices.deleteProspectiveSponsor(ps.prospectiveSponsorId, head, organization)
      ).rejects.toThrow(new DeletedException('ProspectiveSponsor', ps.prospectiveSponsorId));
    });

    it('Succeeds and soft deletes prospective sponsor', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      const result = await ProspectiveSponsorServices.deleteProspectiveSponsor(ps.prospectiveSponsorId, head, organization);

      expect(result.prospectiveSponsorId).toBe(ps.prospectiveSponsorId);

      const deletedPs = await prisma.prospective_Sponsor.findUnique({
        where: { prospectiveSponsorId: ps.prospectiveSponsorId }
      });

      expect(deletedPs?.dateDeleted).not.toBeNull();
    });
  });

  describe('Get Prospective Sponsor Tasks', () => {
    it('Fails if prospective sponsor does not exist', async () => {
      await expect(ProspectiveSponsorServices.getProspectiveSponsorTasks('nonexistent-id', orgId)).rejects.toThrow(
        new NotFoundException('ProspectiveSponsor', 'nonexistent-id')
      );
    });

    it('Returns tasks for prospective sponsor', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      const task1 = await ProspectiveSponsorServices.createProspectiveSponsorTask(
        head,
        organization,
        ps.prospectiveSponsorId,
        new Date(2024, 6, 15),
        'Follow up on initial contact'
      );

      const task2 = await ProspectiveSponsorServices.createProspectiveSponsorTask(
        head,
        organization,
        ps.prospectiveSponsorId,
        new Date(2024, 7, 1),
        'Send proposal'
      );

      const results = await ProspectiveSponsorServices.getProspectiveSponsorTasks(ps.prospectiveSponsorId, orgId);

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.sponsorTaskId)).toContain(task1.sponsorTaskId);
      expect(results.map((r) => r.sponsorTaskId)).toContain(task2.sponsorTaskId);
    });
  });

  describe('Create Prospective Sponsor Task', () => {
    it('Fails if user is not on finance team or a head', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.createProspectiveSponsorTask(
          guest,
          organization,
          ps.prospectiveSponsorId,
          new Date(),
          'Follow up'
        )
      ).rejects.toThrow(
        new AccessDeniedException('Only finance team members or heads can create prospective sponsor tasks')
      );
    });

    it('Fails if prospective sponsor does not exist', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        ProspectiveSponsorServices.createProspectiveSponsorTask(
          head,
          organization,
          'nonexistent-id',
          new Date(),
          'Follow up'
        )
      ).rejects.toThrow(new NotFoundException('ProspectiveSponsor', 'nonexistent-id'));
    });

    it('Fails if prospective sponsor is deleted', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await ProspectiveSponsorServices.deleteProspectiveSponsor(ps.prospectiveSponsorId, head, organization);

      await expect(
        ProspectiveSponsorServices.createProspectiveSponsorTask(
          head,
          organization,
          ps.prospectiveSponsorId,
          new Date(),
          'Follow up'
        )
      ).rejects.toThrow(new DeletedException('ProspectiveSponsor', ps.prospectiveSponsorId));
    });

    it('Fails if assignee does not exist', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.createProspectiveSponsorTask(
          head,
          organization,
          ps.prospectiveSponsorId,
          new Date(),
          'Follow up',
          undefined,
          'nonexistent-user-id'
        )
      ).rejects.toThrow(new NotFoundException('User', 'nonexistent-user-id'));
    });

    it('Succeeds and creates task without assignee', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);
      const dueDate = new Date(2024, 6, 15);
      const notifyDate = new Date(2024, 6, 10);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      const result = await ProspectiveSponsorServices.createProspectiveSponsorTask(
        head,
        organization,
        ps.prospectiveSponsorId,
        dueDate,
        'Follow up on initial contact',
        notifyDate
      );

      expect(result.dueDate).toEqual(dueDate);
      expect(result.notifyDate).toEqual(notifyDate);
      expect(result.notes).toBe('Follow up on initial contact');
      expect(result.assignee).toBeUndefined();
      expect(result.done).toBe(false);
    });

    it('Succeeds and creates task with assignee', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);
      const assignee = await createTestUser(supermanAdmin, orgId);
      const dueDate = new Date(2024, 6, 15);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      const result = await ProspectiveSponsorServices.createProspectiveSponsorTask(
        head,
        organization,
        ps.prospectiveSponsorId,
        dueDate,
        'Follow up on initial contact',
        undefined,
        assignee.userId
      );

      expect(result.dueDate).toEqual(dueDate);
      expect(result.notes).toBe('Follow up on initial contact');
      expect(result.assignee?.userId).toBe(assignee.userId);
    });
  });

  describe('Accept Prospective Sponsor', () => {
    it('Fails if user is not a head', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.acceptProspectiveSponsor(
          guest,
          organization,
          ps.prospectiveSponsorId,
          sponsorTierId,
          ['MONETARY'],
          new Date(),
          [2024],
          false,
          5000
        )
      ).rejects.toThrow(new AccessDeniedException('Only heads can accept prospective sponsors'));
    });

    it('Fails if prospective sponsor does not exist', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        ProspectiveSponsorServices.acceptProspectiveSponsor(
          head,
          organization,
          'nonexistent-id',
          sponsorTierId,
          ['MONETARY'],
          new Date(),
          [2024],
          false,
          5000
        )
      ).rejects.toThrow(new NotFoundException('ProspectiveSponsor', 'nonexistent-id'));
    });

    it('Fails if prospective sponsor is deleted', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await ProspectiveSponsorServices.deleteProspectiveSponsor(ps.prospectiveSponsorId, head, organization);

      await expect(
        ProspectiveSponsorServices.acceptProspectiveSponsor(
          head,
          organization,
          ps.prospectiveSponsorId,
          sponsorTierId,
          ['MONETARY'],
          new Date(),
          [2024],
          false,
          5000
        )
      ).rejects.toThrow(new DeletedException('ProspectiveSponsor', ps.prospectiveSponsorId));
    });

    it('Fails if prospective sponsor is already accepted (soft-deleted)', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await ProspectiveSponsorServices.acceptProspectiveSponsor(
        head,
        organization,
        ps.prospectiveSponsorId,
        sponsorTierId,
        ['MONETARY'],
        new Date(),
        [2024],
        false,
        5000
      );

      // After accepting, the prospective sponsor is soft-deleted, so trying to accept again throws DeletedException
      await expect(
        ProspectiveSponsorServices.acceptProspectiveSponsor(
          head,
          organization,
          ps.prospectiveSponsorId,
          sponsorTierId,
          ['MONETARY'],
          new Date(),
          [2024, 2025],
          true,
          10000
        )
      ).rejects.toThrow(new DeletedException('ProspectiveSponsor', ps.prospectiveSponsorId));
    });

    it('Fails if sponsor tier does not exist', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.acceptProspectiveSponsor(
          head,
          organization,
          ps.prospectiveSponsorId,
          'nonexistent-tier-id',
          ['MONETARY'],
          new Date(),
          [2024],
          false,
          5000
        )
      ).rejects.toThrow(new NotFoundException('SponsorTier', 'nonexistent-tier-id'));
    });

    it('Fails if sponsor with same name already exists', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);

      // Create an existing sponsor with the same name
      await FinanceServices.createSponsor(
        head,
        'Acme Corp',
        true,
        ['MONETARY'],
        new Date(),
        [2024],
        sponsorTierId,
        false,
        'Existing Contact',
        [],
        organization,
        5000,
        undefined,
        undefined,
        'test@test.com'
      );

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        undefined,
        'contact@test.com'
      );

      await expect(
        ProspectiveSponsorServices.acceptProspectiveSponsor(
          head,
          organization,
          ps.prospectiveSponsorId,
          sponsorTierId,
          ['MONETARY'],
          new Date(),
          [2024],
          false,
          5000
        )
      ).rejects.toThrow(new HttpException(400, 'A sponsor with the name "Acme Corp" already exists.'));
    });

    it('Succeeds and creates sponsor from prospective sponsor', async () => {
      const head = await createTestUser(batmanAppAdmin, orgId);
      const joinDate = new Date(2024, 6, 1);

      const ps = await ProspectiveSponsorServices.createProspectiveSponsor(
        head,
        organization,
        'Acme Corp',
        new Date(),
        FirstContactMethod.INBOUND_EMAIL,
        'John Doe',
        head.userId,
        14,
        'john@acme.com',
        '555-1234',
        'CEO'
      );

      const result = await ProspectiveSponsorServices.acceptProspectiveSponsor(
        head,
        organization,
        ps.prospectiveSponsorId,
        sponsorTierId,
        ['MONETARY'],
        joinDate,
        [2024, 2025],
        true,
        10000,
        'ACME10',
        'Great partner!'
      );

      // Check that prospective sponsor status is updated
      expect(result.status).toBe(ProspectiveSponsorStatus.ACCEPTED);

      // Verify the sponsor was created
      const sponsors = await FinanceServices.getAllSponsors(organization);
      const createdSponsor = sponsors.find((s) => s.name === 'Acme Corp');

      expect(createdSponsor).toBeDefined();
      expect(createdSponsor!.name).toBe('Acme Corp');
      expect(createdSponsor!.activeStatus).toBe(true);
      expect(createdSponsor!.sponsorValue).toBe(10000);
      expect(createdSponsor!.joinDate).toEqual(joinDate);
      expect(createdSponsor!.activeYears).toEqual([2024, 2025]);
      expect(createdSponsor!.tier!.sponsorTierId).toBe(sponsorTierId);
      expect(createdSponsor!.taxExempt).toBe(true);
      expect(createdSponsor!.discountCode).toBe('ACME10');
      expect(createdSponsor!.sponsorNotes).toBe('Great partner!');
      expect(createdSponsor!.contact.name).toBe('John Doe');
      expect(createdSponsor!.contact.email).toBe('john@acme.com');
      expect(createdSponsor!.contact.phone).toBe('555-1234');
      expect(createdSponsor!.contact.position).toBe('CEO');

      // Verify the prospective sponsor was soft-deleted
      const allProspectiveSponsors = await ProspectiveSponsorServices.getAllProspectiveSponsors(organization);
      const deletedPs = allProspectiveSponsors.find((p) => p.prospectiveSponsorId === ps.prospectiveSponsorId);
      expect(deletedPs).toBeUndefined(); // Should not appear in the list since it's soft-deleted
    });
  });
});
