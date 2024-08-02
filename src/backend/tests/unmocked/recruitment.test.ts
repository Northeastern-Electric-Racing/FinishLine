import RecruitmentServices from '../../src/services/recruitment.services';
import { AccessDeniedAdminOnlyException, HttpException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';

describe('Recruitment Tests', () => {
  let orgId: string;
  beforeEach(async () => {
    orgId = (await createTestOrganization()).organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Milestone', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () =>
          await RecruitmentServices.createMilestone(
            await createTestUser(wonderwomanGuest, orgId),
            'name',
            'description',
            new Date(),
            orgId
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a milestone'));
    });

    it('Fails if organization doesn`t exist', async () => {
      await expect(
        async () =>
          await RecruitmentServices.createMilestone(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'description',
            new Date(),
            '1'
          )
      ).rejects.toThrow(new HttpException(400, `Organization with id 1 doesn't exist`));
    });

    it('Succeeds and creates a milestone', async () => {
      const result = await RecruitmentServices.createMilestone(
        await createTestUser(batmanAppAdmin, orgId),
        'name',
        'description',
        new Date('11/12/24'),
        orgId
      );

      expect(result.name).toEqual('name');
      expect(result.description).toEqual('description');
      expect(result.dateOfEvent).toEqual(new Date('11/12/24'));
    });
  });
});
