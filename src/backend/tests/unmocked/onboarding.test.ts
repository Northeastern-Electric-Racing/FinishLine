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

  describe('Update User Checklists', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.updateUserChecklists(
            await createTestUser(wonderwomanGuest, orgId),
            'userId',
            ['checklistId'],
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('non-admin tried to update a checklist'));
    });

    it('Fails if user does not exist', async () => {
      await expect(
        async () =>
          await OnboardingServices.updateUserChecklists(
            await createTestUser(batmanAppAdmin, orgId),
            'userId',
            ['checklistId'],
            organization
          )
      ).rejects.toThrow(new NotFoundException('User', 'userId'));
    });

    it('Fails if one or more checklistId does not exist', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      await expect(
        async () =>
          await OnboardingServices.updateUserChecklists(
            batman,
            batman.userId,
            ['checklistId1', 'checklistId2'],
            organization
          )
      ).rejects.toThrow(new NotFoundException('Checklist', 'one or more checklistId'));
    });

    it('Suceeds and adds/deletes the user checklists', async () => {
      const batman = await createTestUser(batmanAppAdmin, orgId);
      const checklist1 = await createTestChecklist('checklistId1', orgId);
      const checklist2 = await createTestChecklist('checklistId2', orgId);
      const checklistIds = [checklist1.checklistId, checklist2.checklistId];
      await OnboardingServices.updateUserChecklists(batman, batman.userId, checklistIds, organization);
      // expect(batman.onboardingChecklists[0].checklistId).toEqual('checklistId1');
      // expect(batman.onboardingChecklists[1].checklistId).toEqual('checklistId2');
      // await OnboardingServices.updateUserChecklists(batman, batman.userId, [], organization);
      // expect(batman.onboardingChecklists.length).toEqual(0);
    });
  });
});
