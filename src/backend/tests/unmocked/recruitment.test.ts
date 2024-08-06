import RecruitmentServices from '../../src/services/recruitment.services';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
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

  describe('Edit Milestone', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () =>
          await RecruitmentServices.editMilestone(
            await createTestUser(wonderwomanGuest, orgId),
            'name',
            'description',
            new Date(),
            '1',
            orgId
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a milestone'));
    });

    it('Fails if organization doesn`t exist', async () => {
      await expect(
        async () =>
          await RecruitmentServices.editMilestone(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'description',
            new Date(),
            '1',
            '1'
          )
      ).rejects.toThrow(new HttpException(400, `Organization with id 1 doesn't exist`));
    });

    it('Fails if milestone doesn`t exist', async () => {
      await expect(
        async () =>
          await RecruitmentServices.editMilestone(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'description',
            new Date('11/12/24'),
            '1',
            orgId
          )
      ).rejects.toThrow(new NotFoundException('Milestone', 1));
    });

    it('Succeeds and creates a milestone', async () => {
      const milestone = await RecruitmentServices.createMilestone(
        await createTestUser(batmanAppAdmin, orgId),
        'name',
        'description',
        new Date('11/12/24'),
        orgId
      );

      const updatedMilestone = await RecruitmentServices.editMilestone(
        await createTestUser(supermanAdmin, orgId),
        'new name',
        'new description',
        new Date('11/14/24'),
        milestone.milestoneId,
        orgId
      );

      expect(updatedMilestone.name).toEqual('new name');
      expect(updatedMilestone.description).toEqual('new description');
      expect(updatedMilestone.dateOfEvent).toEqual(new Date('11/14/24'));
    });
  });

  describe('Get All Milestones', () => {
    it('Fails if the organization ID is wrong', async () => {
      await expect(
        async () =>
          await RecruitmentServices.createMilestone(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'description',
            new Date('11/11/24'),
            '55'
          )
      ).rejects.toThrow(new HttpException(400, `Organization with id 55 doesn't exist`));
    });

    it('Succeeds and gets all the milestones', async () => {
      const milestone1 = await RecruitmentServices.createMilestone(
        await createTestUser(batmanAppAdmin, orgId),
        'name',
        'description',
        new Date('11/11/24'),
        orgId
      );
      const milestone2 = await RecruitmentServices.createMilestone(
        await createTestUser(supermanAdmin, orgId),
        'name2',
        'description2',
        new Date('1/1/1'),
        orgId
      );
      const result = await RecruitmentServices.getAllMilestones(orgId);
      expect(result).toStrictEqual([milestone1, milestone2]);
    });
  });
});
