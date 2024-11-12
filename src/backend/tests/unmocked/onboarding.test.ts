import { Organization } from '@prisma/client';
import { createTestChecklist, createTestOrganization, createTestTeamType, createTestUser, resetUsers } from '../test-utils';
import OnboardingServices from '../../src/services/onboarding.services';
import { batmanAppAdmin, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../../src/utils/errors.utils';
import prisma from '../../src/prisma/prisma';

describe('Onboarding tests', () => {
  let orgId: string;
  let organization: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });
  describe('Get all Checklists', () => {
    it('Gets all checklists and checklistItems for the given organization', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist(batman, orgId);
      const checklist2 = await createTestChecklist(batman, orgId);
      const allChecklists = await OnboardingServices.getAllChecklists(organization);
      expect(allChecklists[0].checklistId).toEqual(checklist1.checklistId);
      expect(allChecklists[1].checklistId).toEqual(checklist2.checklistId);
      expect(allChecklists[0].checklistItems.length).toEqual(1);
    });

    it('Gets all checklists and checklistItems that are not deleted', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist(batman, orgId);
      await prisma.checklist.update({
        where: { checklistId: checklist1.checklistId },
        data: { checklistItems: { deleteMany: {} } }
      });
      const allChecklists = await OnboardingServices.getAllChecklists(organization);
      expect(allChecklists.length).toEqual(1);
      expect(allChecklists[0].checklistItems.length).toEqual(0);
    });
  });

  describe('Create Checklist', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            await createTestUser(wonderwomanGuest, orgId),
            'name',
            'teamTypeId',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('non-admin tried to create a checklist'));
    });

    it('Fails if team type does not exists', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'teamType',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Team Type', 'teamType'));
    });

    it('Succeeds and creates a checklist', async () => {
      createTestTeamType('id', organization);
      const result = await OnboardingServices.createChecklist(
        await createTestUser(batmanAppAdmin, orgId),
        'name',
        'id',
        organization
      );
      expect(result.name).toEqual('name');
      expect(result.teamTypeId).toEqual('id');
    });
  });

  describe('Delete Checklist', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.deleteChecklist(await createTestUser(wonderwomanGuest, orgId), 'id', organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete a checklist'));
    });

    it('Fails if checklistId is not found', async () => {
      await expect(
        async () =>
          await OnboardingServices.deleteChecklist(await createTestUser(batmanAppAdmin, orgId), 'id1', organization)
      ).rejects.toThrow(new HttpException(400, 'Checklist with id: id1 not found!'));
    });

    it('Fails if checklist is already deleted', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testChecklist = await createTestChecklist(testSuperman, orgId);
      await OnboardingServices.deleteChecklist(testSuperman, testChecklist.checklistId, organization);

      await expect(
        async () => await OnboardingServices.deleteChecklist(testSuperman, testChecklist.checklistId, organization)
      ).rejects.toThrow(new DeletedException('Checklist', testChecklist.checklistId));
    });

    it('Succeeds and deletes checklist', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testChecklist1 = await createTestChecklist(testSuperman, orgId);
      await OnboardingServices.deleteChecklist(testSuperman, testChecklist1.checklistId, organization);

      const updatedTestChecklist1 = await prisma.checklist.findUnique({
        where: { checklistId: testChecklist1.checklistId }
      });
      expect(updatedTestChecklist1?.dateDeleted).not.toBe(null);
    });
  });

  describe('Create Checklist Item', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklistItem(
            await createTestUser(wonderwomanGuest, orgId),
            'name',
            'checklistId',
            'description',
            'parentChecklistItemId',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('non-admin tried to create a checklist item'));
    });

    it('Fails if checklist does not exist', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklistItem(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'checklistId',
            'description',
            null,
            organization
          )
      ).rejects.toThrow(new NotFoundException('Checklist', 'checklistId'));
    });

    it('Fails if parent checklist item does not exist', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testChecklistId = (await createTestChecklist(testBatman, orgId)).checklistId;
      await expect(
        async () =>
          await OnboardingServices.createChecklistItem(
            testBatman,
            'name',
            testChecklistId,
            'parentChecklistItemId',
            'description',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Checklist Item', 'parentChecklistItemId'));
    });

    it('Succeeds and creates a checklist', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testChecklistId = (await createTestChecklist(testBatman, orgId)).checklistId;
      const result = await OnboardingServices.createChecklistItem(
        testBatman,
        'name',
        testChecklistId,
        null,
        null,
        organization
      );
      expect(result.name).toEqual('name');
      expect(result.checklistId).toEqual(testChecklistId);
    });
  });
});
