import prisma from '../../src/prisma/prisma';
import RecruitmentServices from '../../src/services/recruitment.services';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../../src/utils/errors.utils';
import { createTestMilestone, createTestFAQ, createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin, member } from '../test-data/users.test-data';

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

    describe('Edit FAQ', () => {
      it('Fails if organization doesn`t exist', async () => {
        await expect(
          async () =>
            await RecruitmentServices.editFAQ(
              'What is your return policy?',
              'You can return any item within 30 days of purchase.',
              await createTestUser(wonderwomanGuest, orgId),
              '1',
              'faq123'
            )
        ).rejects.toThrow(new NotFoundException('Organization', 1));
      });
      it('Fails if user is not an admin', async () => {
        await expect(
          async () =>
            await RecruitmentServices.editFAQ(
              'What is your return policy?',
              'You can return any item within 30 days of purchase.',
              await createTestUser(wonderwomanGuest, orgId),
              orgId,
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
              orgId,
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
          orgId,
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
        ).rejects.toThrow(new NotFoundException('Organization', 1));
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
        ).rejects.toThrow(new NotFoundException('Organization', 1));
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

      it('Fails if milestone is deleted', async () => {
        const milestone = await RecruitmentServices.createMilestone(
          await createTestUser(batmanAppAdmin, orgId),
          'name',
          'description',
          new Date('11/12/24'),
          orgId
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
              orgId
            )
        ).rejects.toThrow(new NotFoundException('Milestone', milestone.milestoneId));
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
        ).rejects.toThrow(new NotFoundException('Organization', 55));
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
          ).rejects.toThrow(new NotFoundException('Organization', 1));
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

        describe('Create FAQ', () => {
          it('Fails if user is not an admin', async () => {
            await expect(
              async () =>
                await RecruitmentServices.createFaq(await createTestUser(member, orgId), 'question', 'answer', orgId)
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
    });
  });
});