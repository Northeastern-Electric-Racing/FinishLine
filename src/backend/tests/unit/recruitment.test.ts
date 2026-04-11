import prisma from '../../src/prisma/prisma.js';
import { Organization, User } from '@prisma/client';
import RecruitmentServices from '../../src/services/recruitment.services.js';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../../src/utils/errors.utils.js';
import {
  createTestGuestDefinition,
  createTestMilestone,
  createTestFaq,
  createTestFAQ,
  createTestOrganization,
  createTestUser,
  resetUsers
} from '../test-utils.js';
import { GuestDefinitionType } from 'shared';
import {
  batmanAppAdmin,
  wonderwomanGuest,
  supermanAdmin,
  member,
  theVisitorGuest,
  flashAdmin,
  alfred
} from '../test-data/users.test-data.js';

describe('Recruitment Tests', () => {
  let orgId: string;
  let organization: Organization;
  let superman: User;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    superman = await createTestUser(supermanAdmin, orgId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get All FAQs', () => {
    it('Succeeds and gets all the FAQs', async () => {
      const faq1 = await RecruitmentServices.createOrganizationFaq(
        await createTestUser(batmanAppAdmin, orgId),
        'question',
        'answer',
        organization
      );
      const faq2 = await RecruitmentServices.createOrganizationFaq(superman, 'question2', 'answer2', organization);
      const result = await RecruitmentServices.getAllOrganizationFaqs(organization);
      expect(result).toHaveLength(2);
      expect(result[0].question).toEqual(faq1.question);
      expect(result[0].answer).toEqual(faq1.answer);
      expect(result[1].question).toEqual(faq2.question);
      expect(result[1].answer).toEqual(faq2.answer);
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
              superman,
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
          superman,
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
          superman,
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
            await RecruitmentServices.createOrganizationFaq(
              await createTestUser(member, orgId),
              'question',
              'answer',
              organization
            )
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
          ).rejects.toThrow(new NotFoundException('Milestone', 'id1'));
        });

        it('Fails if milestone is already deleted', async () => {
          const testSuperman = superman;
          const testMilestone = await createTestMilestone(testSuperman, orgId);
          await RecruitmentServices.deleteMilestone(testSuperman, testMilestone.milestoneId, organization);

          await expect(
            async () => await RecruitmentServices.deleteMilestone(testSuperman, testMilestone.milestoneId, organization)
          ).rejects.toThrow(new DeletedException('Milestone', testMilestone.milestoneId));
        });

        it('Succeeds and deletes milestone', async () => {
          const testSuperman = superman;
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
                await RecruitmentServices.createOrganizationFaq(
                  await createTestUser(member, orgId),
                  'question',
                  'answer',
                  organization
                )
            ).rejects.toThrow(new AccessDeniedAdminOnlyException('create an faq'));
          });

          it('Succeeds and creates an FAQ', async () => {
            const result = await RecruitmentServices.createOrganizationFaq(
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
        async () =>
          await RecruitmentServices.deleteFaq(await createTestUser(theVisitorGuest, orgId), testFaq.faqId, organization)
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

      await expect(async () => await RecruitmentServices.deleteFaq(superman, testFaq.faqId, organization)).rejects.toThrow(
        new DeletedException('Faq', testFaq.faqId)
      );
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

  describe('Create Guest Definitions', () => {
    it('Successful guest definition creation', async () => {
      const def = await RecruitmentServices.createGuestDefinition(
        superman,
        organization,
        'test term',
        'test description',
        2,
        GuestDefinitionType.INFO_PAGE,
        'iconname',
        'buttonTxt',
        'buttonLink'
      );

      expect(def.term).toBe('test term');
      expect(def.description).toBe('test description');
      expect(def.order).toBe(2);
      expect(def.icon).toBe('iconname');
      expect(def.buttonText).toBe('buttonTxt');
      expect(def.buttonLink).toBe('buttonLink');
    });
    it('Fails when non admin tries to create guest definition', async () => {
      await expect(
        async () =>
          await RecruitmentServices.createGuestDefinition(
            await createTestUser(member, orgId),
            organization,
            'test term',
            'test description',
            2,
            GuestDefinitionType.INFO_PAGE,
            'iconname',
            'buttonTxt',
            'buttonLink'
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a guest definition'));
    });
  });
  describe('Edit Guest Definition', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () =>
          await RecruitmentServices.editGuestDefinition(
            await createTestUser(member, orgId),
            organization,
            'test term',
            'test description',
            'test definition id',
            2,
            GuestDefinitionType.INFO_PAGE,
            'buttonTxt',
            'buttonLink'
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit a guest definition'));
    });

    it('Fails if guest definition doesn`t exist', async () => {
      await expect(
        async () =>
          await RecruitmentServices.editGuestDefinition(
            await createTestUser(batmanAppAdmin, orgId),
            organization,
            'term',
            'description',
            'definition id',
            2,
            GuestDefinitionType.INFO_PAGE,
            'buttonTxt',
            'buttonLink'
          )
      ).rejects.toThrow(new NotFoundException('Guest Definition', 'definition id'));
    });

    it('Successful edit guest definition', async () => {
      const def = await RecruitmentServices.createGuestDefinition(
        superman,
        organization,
        'test term',
        'test description',
        2,
        GuestDefinitionType.INFO_PAGE,
        'iconname',
        'buttonTxt',
        'buttonLink'
      );

      const edited = await RecruitmentServices.editGuestDefinition(
        await createTestUser(batmanAppAdmin, orgId),
        organization,
        'new term',
        'new description',
        def.definitionId,
        4,
        GuestDefinitionType.INFO_PAGE,
        'new icon',
        'new text',
        'new link'
      );

      expect(edited.term).toBe('new term');
      expect(edited.description).toBe('new description');
      expect(edited.order).toBe(4);
      expect(edited.icon).toBe('new icon');
      expect(edited.buttonText).toBe('new text');
      expect(edited.buttonLink).toBe('new link');
    });

    it('Edit guest definition fails if defintion is deleted', async () => {
      const def = await RecruitmentServices.createGuestDefinition(
        superman,
        organization,
        'test term',
        'test description',
        2,
        GuestDefinitionType.INFO_PAGE,
        'iconname',
        'buttonTxt',
        'buttonLink'
      );

      const batman = await createTestUser(batmanAppAdmin, orgId);

      await RecruitmentServices.deleteGuestDefinition(batman, def.definitionId, organization);

      await expect(
        async () =>
          await RecruitmentServices.editGuestDefinition(
            batman,
            organization,
            'term',
            'description',
            def.definitionId,
            2,
            GuestDefinitionType.INFO_PAGE,
            'buttonTxt',
            'buttonLink'
          )
      ).rejects.toThrow(new DeletedException('Guest Definition', def.definitionId));
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
            superman,
            'name',
            'description',
            new Date('11/12/24'),
            milestone.milestoneId,
            organization
          )
      ).rejects.toThrow(new NotFoundException('Milestone', milestone.milestoneId));
    });
  });

  describe('Delete Guest Definition', () => {
    it('Fails if user is not an admin', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);
      const testDef = await createTestGuestDefinition(admin, orgId);

      await expect(
        async () => await RecruitmentServices.deleteGuestDefinition(guest, testDef.definitionId, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete a guestDefinition'));
    });

    it('Fails if definition does not exist', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        async () => await RecruitmentServices.deleteGuestDefinition(admin, 'fake-id', organization)
      ).rejects.toThrow(new NotFoundException('Guest Definition', 'fake-id'));
    });

    it('Fails if definition is already deleted', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const testDef = await createTestGuestDefinition(admin, orgId);
      await RecruitmentServices.deleteGuestDefinition(admin, testDef.definitionId, organization);

      await expect(
        async () => await RecruitmentServices.deleteGuestDefinition(admin, testDef.definitionId, organization)
      ).rejects.toThrow(new DeletedException('Guest Definition', testDef.definitionId));
    });

    it('Successfully deletes a guest definition', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);
      const testDef = await createTestGuestDefinition(admin, orgId);

      await RecruitmentServices.deleteGuestDefinition(admin, testDef.definitionId, organization);

      const deletedTestDef = await prisma.guest_Definition.findUnique({
        where: { definitionId: testDef.definitionId }
      });

      expect(deletedTestDef?.dateDeleted).not.toBe(null);
    });
  });

  describe('Get All Guest Definitions', () => {
    it('Succeeds and gets all the guest definitions', async () => {
      const def = await RecruitmentServices.createGuestDefinition(
        superman,
        organization,
        'test term',
        'test description',
        2,
        GuestDefinitionType.INFO_PAGE,
        'iconname',
        'buttonTxt',
        'buttonLink'
      );

      const def2 = await RecruitmentServices.createGuestDefinition(
        superman,
        organization,
        'test term',
        'test description',
        2,
        GuestDefinitionType.INFO_PAGE,
        'iconname',
        'buttonTxt',
        'buttonLink'
      );

      const result = await RecruitmentServices.getAllGuestDefinitions(organization);
      expect(result).toStrictEqual([def, def2]);
    });
  });
});
