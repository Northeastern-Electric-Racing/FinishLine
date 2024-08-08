import prisma from '../../src/prisma/prisma';
import RecruitmentServices from '../../src/services/recruitment.services';
import { AccessDeniedAdminOnlyException, DeletedException, HttpException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin } from '../test-data/users.test-data';
import { createTestMilestone, createTestOrganization, createTestUser, resetUsers } from '../test-utils';

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

  describe('Get All Milestones', () => {
    it('Fails if the organization ID is wrong', async () => {
      await expect(
        async () =>
          await RecruitmentServices.createMilestone(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'description',
            new Date(),
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

  describe('Delete a single milestone', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () => await RecruitmentServices.deleteMilestone(await createTestUser(wonderwomanGuest, orgId), 'id', orgId)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete milestone'));
    });

    it('Fails if milestoneId is not found', async () => {
      await expect(
        async () => await RecruitmentServices.deleteMilestone(await createTestUser(batmanAppAdmin, orgId), 'id1', orgId)
      ).rejects.toThrow(new HttpException(400, 'Milestone with id: id1 not found!'));
    });

    it('Fails if milestone is already deleted', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testMilestone = await createTestMilestone(testSuperman, orgId);
      await RecruitmentServices.deleteMilestone(testSuperman, testMilestone.milestoneId, orgId);

      await expect(
        async () => await RecruitmentServices.deleteMilestone(testSuperman, testMilestone.milestoneId, orgId)
      ).rejects.toThrow(new DeletedException('Milestone', testMilestone.milestoneId));
    });

    it('Succeeds and deletes milestone', async () => {
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      const testMilestone1 = await createTestMilestone(testSuperman, orgId);

      await RecruitmentServices.deleteMilestone(testSuperman, testMilestone1.milestoneId, orgId);

      const updatedTestMilestone1 = await prisma.milestone.findUnique({
        where: { milestoneId: testMilestone1.milestoneId }
      });

      expect(updatedTestMilestone1?.dateDeleted).not.toBe(null);
    });
  });
});
