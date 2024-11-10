import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTeamType, createTestUser, resetUsers } from '../test-utils';
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
});
