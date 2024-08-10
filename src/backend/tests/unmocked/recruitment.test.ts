import RecruitmentServices from '../../src/services/recruitment.services';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin, member } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';

describe('Recruitment Tests', () => {
  let orgId: string;
  beforeEach(async () => {
    orgId = (await createTestOrganization()).organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get All FAQs', () => {
    it('Fails if organization doesn`t exist', async () => {
      await expect(
        async () =>
          await RecruitmentServices.createFaq(await createTestUser(batmanAppAdmin, orgId), 'question', 'answer', '5')
      ).rejects.toThrow(new NotFoundException('Organization', `5`));
    });

    it('Succeeds and gets all the FAQs', async () => {
      const faq1 = await RecruitmentServices.createFaq(
        await createTestUser(batmanAppAdmin, orgId),
        'question',
        'answer',
        orgId
      );
      const faq2 = await RecruitmentServices.createFaq(
        await createTestUser(supermanAdmin, orgId),
        'question2',
        'answer2',
        orgId
      );
      const result = await RecruitmentServices.getAllFaqs(orgId);
      expect(result).toStrictEqual([faq1, faq2]);
    });
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

  describe('Create FAQ', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () => await RecruitmentServices.createFaq(await createTestUser(member, orgId), 'question', 'answer', orgId)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create an faq'));
    });

    it('Fails if organization doesn`t exist', async () => {
      await expect(
        async () =>
          await RecruitmentServices.createFaq(await createTestUser(batmanAppAdmin, orgId), 'question', 'answer', '5')
      ).rejects.toThrow(new NotFoundException('Organization', `5`));
    });

    it('Succeeds and creates an FAQ', async () => {
      const result = await RecruitmentServices.createFaq(
        await createTestUser(batmanAppAdmin, orgId),
        'question',
        'answer',
        orgId
      );

      expect(result.question).toEqual('question');
      expect(result.answer).toEqual('answer');
    });
  });
});
