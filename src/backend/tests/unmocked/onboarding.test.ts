import { Organization } from '@prisma/client';
import { createTestChecklist, createTestOrganization, createTestTeamType, createTestUser, resetUsers } from '../test-utils';
import OnboardingServices from '../../src/services/onboarding.services';
import { batmanAppAdmin, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { AccessDeniedAdminOnlyException, DeletedException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
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

    it('Fails if team type does not exits', async () => {
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

    it('Suceeds and creates a checklist', async () => {
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
});
