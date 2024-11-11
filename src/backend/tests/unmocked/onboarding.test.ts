import { Organization } from '@prisma/client';
import { createTestChecklist, createTestOrganization, createTestTeamType, createTestUser, resetUsers } from '../test-utils';
import OnboardingServices from '../../src/services/onboarding.services';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { AccessDeniedAdminOnlyException, NotFoundException } from '../../src/utils/errors.utils';

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

    it('Succeeds and creates a checklist', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      createTestChecklist(testBatman, 'id', organization);
      const result = await OnboardingServices.createChecklistItem(testBatman, 'name', 'id', null, null, organization);
      expect(result.name).toEqual('name');
      expect(result.checklistId).toEqual('id');
    });
  });
});
