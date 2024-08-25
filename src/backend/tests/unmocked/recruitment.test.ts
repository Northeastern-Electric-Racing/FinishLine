import prisma from '../../src/prisma/prisma';
import { Organization } from '@prisma/client';
import RecruitmentServices from '../../src/services/recruitment.services';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../../src/utils/errors.utils';
import {
  createTestMilestone,
  createTestFaq,
  createTestFAQ,
  createTestOrganization,
  createTestUser,
  resetUsers
} from '../test-utils';
import {
  batmanAppAdmin,
  wonderwomanGuest,
  supermanAdmin,
  member,
  theVisitorGuest,
  flashAdmin,
  alfred
} from '../test-data/users.test-data';

describe('Recruitment Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get All FAQs', () => {
    it('Succeeds and gets all the FAQs', async () => {
      const faq1 = await RecruitmentServices.createFaq(
        await createTestUser(batmanAppAdmin, orgId),
        'question',
        'answer',
        organization
      );
      const faq2 = await RecruitmentServices.createFaq(
        await createTestUser(supermanAdmin, orgId),
        'question2',
        'answer2',
        organization
      );
      const result = await RecruitmentServices.getAllFaqs(organization);
      expect(result).toStrictEqual([faq1, faq2]);
    });

    describe('Edit FAQ', () => {
      it('Fails if user is not an admin', async () => {
        await expect(
          async () =>
            await RecruitmentServices.editFAQ(
              'What is your return policy?',
              'You can return any item within 30 days of purchase.',
              await createTestUser(wonderwomanGuest, orgId),
              organization,
              'faq123'
            )
        ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit frequently asked questions'));
      });

      it('Fails if FAQ does not exist', async () => {
        await expect(
          async () =>
            await RecruitmentServices.editFAQ(
              'What is your return policy?',
              'You can return any item within 30 days of purchase.',
              await createTestUser(batmanAppAdmin, orgId),
              organization,
              'nonExistentFaqId'
            )
        ).rejects.toThrow(new NotFoundException('Faq', 'nonExistentFaqId'));
      });

      it('Succeeds and edits an FAQ', async () => {
        await createTestFAQ(orgId, 'faq123');
        const result = await RecruitmentServices.editFAQ(
          'What is your return policy?',
          'You can return any item within 60 days of purchase.',
          await createTestUser(batmanAppAdmin, orgId),
          organization,
          'faq123'
        );

        expect(result.question).toEqual('What is your return policy?');
        expect(result.answer).toEqual('You can return any item within 60 days of purchase.');
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
              organization
            )
        ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a milestone'));
      });

      it('Succeeds and creates a milestone', async () => {
        const result = await RecruitmentServices.createMilestone(
          await createTestUser(batmanAppAdmin, orgId),
          'name',
          'description',
          new Date('11/12/24'),
          organization
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
              organization
            )
        ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a milestone'));
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
              organization
            )
        ).rejects.toThrow(new NotFoundException('Milestone', 1));
      });

      it('Fails if milestone is deleted', async () => {
        const milestone = await RecruitmentServices.createMilestone(
          await createTestUser(batmanAppAdmin, orgId),
          'name',
          'description',
          new Date('11/12/24'),
          organization
        );

        await prisma.milestone.delete({
          where: {
            milestoneId: milestone.milestoneId
          }
        });

        await expect(
          async () =>
            await RecruitmentServices.editMilestone(
              await createTestUser(supermanAdmin, orgId),
              'name',
              'description',
              new Date('11/12/24'),
              milestone.milestoneId,
              organization
            )
        ).rejects.toThrow(new NotFoundException('Milestone', milestone.milestoneId));
      });

      it('Succeeds and edits a milestone', async () => {
        const milestone = await RecruitmentServices.createMilestone(
          await createTestUser(batmanAppAdmin, orgId),
          'name',
          'description',
          new Date('11/12/24'),
          organization
        );

        const updatedMilestone = await RecruitmentServices.editMilestone(
          await createTestUser(supermanAdmin, orgId),
          'new name',
          'new description',
          new Date('11/14/24'),
          milestone.milestoneId,
          organization
        );

        expect(updatedMilestone.name).toEqual('new name');
        expect(updatedMilestone.description).toEqual('new description');
        expect(updatedMilestone.dateOfEvent).toEqual(new Date('11/14/24'));
      });
    });

    describe('Get All Milestones', () => {
      it('Succeeds and gets all the milestones', async () => {
        const milestone1 = await RecruitmentServices.createMilestone(
          await createTestUser(batmanAppAdmin, orgId),
          'name',
          'description',
          new Date('11/11/24'),
          organization
        );

        const milestone2 = await RecruitmentServices.createMilestone(
          await createTestUser(supermanAdmin, orgId),
          'name2',
          'description2',
          new Date('1/1/1'),
          organization
        );
        const result = await RecruitmentServices.getAllMilestones(organization);
        expect(result).toStrictEqual([milestone1, milestone2]);
      });
    });

    describe('Create FAQ', () => {
      it('Fails if user is not an admin', async () => {
        await expect(
          async () =>
            await RecruitmentServices.createFaq(await createTestUser(member, orgId), 'question', 'answer', organization)
        ).rejects.toThrow(new AccessDeniedAdminOnlyException('create an faq'));
      });

      describe('Delete a single milestone', () => {
        it('Fails if user is not admin', async () => {
          await expect(
            async () =>
              await RecruitmentServices.deleteMilestone(await createTestUser(wonderwomanGuest, orgId), 'id', organization)
          ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete milestone'));
        });

        it('Fails if milestoneId is not found', async () => {
          await expect(
            async () =>
              await RecruitmentServices.deleteMilestone(await createTestUser(batmanAppAdmin, orgId), 'id1', organization)
          ).rejects.toThrow(new HttpException(400, 'Milestone with id: id1 not found!'));
        });

        it('Fails if milestone is already deleted', async () => {
          const testSuperman = await createTestUser(supermanAdmin, orgId);
          const testMilestone = await createTestMilestone(testSuperman, orgId);
          await RecruitmentServices.deleteMilestone(testSuperman, testMilestone.milestoneId, organization);

          await expect(
            async () => await RecruitmentServices.deleteMilestone(testSuperman, testMilestone.milestoneId, organization)
          ).rejects.toThrow(new DeletedException('Milestone', testMilestone.milestoneId));
        });

        it('Succeeds and deletes milestone', async () => {
          const testSuperman = await createTestUser(supermanAdmin, orgId);
          const testMilestone1 = await createTestMilestone(testSuperman, orgId);

          await RecruitmentServices.deleteMilestone(testSuperman, testMilestone1.milestoneId, organization);

          const updatedTestMilestone1 = await prisma.milestone.findUnique({
            where: { milestoneId: testMilestone1.milestoneId }
          });

          expect(updatedTestMilestone1?.dateDeleted).not.toBe(null);
        });

        describe('Create FAQ', () => {
          it('Fails if user is not an admin', async () => {
            await expect(
              async () =>
                await RecruitmentServices.createFaq(await createTestUser(member, orgId), 'question', 'answer', organization)
            ).rejects.toThrow(new AccessDeniedAdminOnlyException('create an faq'));
          });

          it('Succeeds and creates an FAQ', async () => {
            const result = await RecruitmentServices.createFaq(
              await createTestUser(batmanAppAdmin, orgId),
              'question',
              'answer',
              organization
            );

            expect(result.question).toEqual('question');
            expect(result.answer).toEqual('answer');
          });
        });
      });
    });
  });

  describe('Delete FAQ', () => {
    it('Fails if user is not an admin', async () => {
      const testFaq = await createTestFaq(await createTestUser(batmanAppAdmin, orgId), orgId);
      await expect(
        async () => await RecruitmentServices.deleteFaq(await createTestUser(theVisitorGuest, orgId), testFaq.faqId, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete an faq'));
    });

    it('Fails if faq doesn`t exist', async () => {
      await expect(
        async () => await RecruitmentServices.deleteFaq(await createTestUser(batmanAppAdmin, orgId), '1', organization)
      ).rejects.toThrow(new NotFoundException('Faq', '1'));
    });

    it('Fails if faq is already deleted', async () => {
      const testFaq = await createTestFaq(await createTestUser(batmanAppAdmin, orgId), orgId);
      await RecruitmentServices.deleteFaq(await createTestUser(flashAdmin, orgId), testFaq.faqId, organization);

      await expect(
        async () => await RecruitmentServices.deleteFaq(await createTestUser(supermanAdmin, orgId), testFaq.faqId, organization)
      ).rejects.toThrow(new DeletedException('Faq', testFaq.faqId));
    });

    it('Succeeds and deletes an FAQ', async () => {
      const testFaq = await createTestFaq(await createTestUser(batmanAppAdmin, orgId), orgId);

      await RecruitmentServices.deleteFaq(await createTestUser(alfred, orgId), testFaq.faqId, organization);

      const deletedTestFaq = await prisma.frequentlyAskedQuestion.findUnique({
        where: { faqId: testFaq.faqId }
      });

      expect(deletedTestFaq?.dateDeleted).not.toBe(null);
    });
  });
});
