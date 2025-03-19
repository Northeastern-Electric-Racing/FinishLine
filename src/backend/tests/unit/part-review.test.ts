import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import PartReviewService from '../../src/services/part-review.services';
import { batmanAppAdmin, supermanAdmin, aquamanLeadership, flashAdmin } from '../test-data/users.test-data';
import prisma from '../../src/prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException } from '../../src/utils/errors.utils';

describe('part review tests', () => {
  let orgId: string;
  let organization: Organization;
  let batman: User;
  let superman: User;
  let nonAdmin: User;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    batman = await createTestUser(batmanAppAdmin, orgId);
    superman = await createTestUser(supermanAdmin, orgId);
    nonAdmin = await createTestUser(aquamanLeadership, orgId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('creates a part tag, edits it, and deletes it', async () => {
    const partTag = await PartReviewService.createPartTag('practice', '#ad6454', batman, orgId);

    const prismaTag = await prisma.partTag.findUnique({
      where: { partTagId: partTag.partTagId }
    });

    expect(partTag.name).toBe('practice');
    expect(partTag.colorHexCode).toBe('#ad6454');
    expect(prismaTag?.name).toBe('practice');
    expect(prismaTag?.colorHexCode).toBe('#ad6454');

    const updatedPartTag = await PartReviewService.updatePartTag(partTag.partTagId, 'important', '#000000', superman, orgId);

    const updatedPrismaTag = await prisma.partTag.findUnique({
      where: { partTagId: partTag.partTagId }
    });

    expect(updatedPartTag.name).toBe('important');
    expect(updatedPartTag.colorHexCode).toBe('#000000');
    expect(updatedPrismaTag?.name).toBe('important');
    expect(updatedPrismaTag?.colorHexCode).toBe('#000000');

    await PartReviewService.deletePartTag(partTag.partTagId, batman, orgId);
    const deletedPrismaTag = await prisma.partTag.findUnique({
      where: { partTagId: partTag.partTagId }
    });

    expect(deletedPrismaTag?.dateDeleted).toBeTruthy();
  });

  it('does not let non-admins create, edit, or delete part tags', async () => {
    await expect(async () => await PartReviewService.createPartTag('name', '#000000', nonAdmin, orgId)).rejects.toThrow(
      new AccessDeniedAdminOnlyException('create part review tag')
    );

    const partTag = await PartReviewService.createPartTag('practice', '#ad6454', batman, orgId);

    await expect(
      async () => await PartReviewService.updatePartTag(partTag.partTagId, 'some thing', 'some thing', nonAdmin, orgId)
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('update part review tag'));

    await expect(async () => await PartReviewService.deletePartTag(partTag.partTagId, nonAdmin, orgId)).rejects.toThrow(
      new AccessDeniedAdminOnlyException('delete part review tag')
    );
  });

  it('does not allow updating deleted part tags', async () => {
    const partTag = await PartReviewService.createPartTag('practice', '#ad6454', batman, orgId);

    await PartReviewService.deletePartTag(partTag.partTagId, superman, orgId);

    await expect(
      async () => await PartReviewService.updatePartTag(partTag.partTagId, 'asdf', 'asdf', batman, orgId)
    ).rejects.toThrow(new DeletedException('Part Tag', partTag.partTagId));
  });

  it('creates a faq, edits it, and deletes it', async () => {
    const faq = await PartReviewService.createFaq('some question', 'some answer', batman, orgId);
    const prismaFaq = await prisma.frequentlyAskedQuestion.findUnique({ where: { faqId: faq.faqId } });

    expect(prismaFaq?.question).toBe('some question');
    expect(prismaFaq?.answer).toBe('some answer');
    expect(prismaFaq?.userCreatedId).toBe(batman.userId);
    expect(prismaFaq?.partReviewFaqOrgId).toBe(orgId);
    expect(prismaFaq?.regularFaqOrgId).toBeFalsy();
    expect(faq?.question).toBe('some question');
    expect(faq?.answer).toBe('some answer');

    const updatedFaq = await PartReviewService.updateFaq(
      faq.faqId,
      'some other question',
      'some other answer',
      superman,
      orgId
    );

    const prismaFaq2 = await prisma.frequentlyAskedQuestion.findUnique({ where: { faqId: faq.faqId } });

    expect(prismaFaq2?.question).toBe('some other question');
    expect(prismaFaq2?.answer).toBe('some other answer');
    expect(prismaFaq2?.userCreatedId).toBe(batman.userId);
    expect(prismaFaq2?.partReviewFaqOrgId).toBe(orgId);
    expect(prismaFaq2?.dateDeleted).toBeFalsy();
    expect(updatedFaq?.question).toBe('some other question');
    expect(updatedFaq?.answer).toBe('some other answer');

    const deletedFaq = await PartReviewService.deleteFaq(faq.faqId, superman, orgId);
    expect(deletedFaq?.question).toBe('some other question');
    expect(deletedFaq?.answer).toBe('some other answer');

    const prismaDeletedFaq = await prisma.frequentlyAskedQuestion.findUnique({ where: { faqId: faq.faqId } });
    expect(prismaDeletedFaq?.dateDeleted).toBeTruthy();
  });

  it('does not let non-admins create, edit, or delete faqs', async () => {
    await expect(
      async () => await PartReviewService.createFaq('some question', 'some answer', nonAdmin, orgId)
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('create part review faq'));

    const faq = await PartReviewService.createFaq('some question', 'some answer', batman, orgId);

    await expect(
      async () => await PartReviewService.updateFaq(faq.faqId, 'some title2', 'some description2', nonAdmin, orgId)
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('update faq'));

    await expect(async () => await PartReviewService.deleteFaq(faq.faqId, nonAdmin, orgId)).rejects.toThrow(
      new AccessDeniedAdminOnlyException('delete faq')
    );
  });

  it('does not allow updating deleted faqs', async () => {
    const faq = await PartReviewService.createFaq('some q', 'some a', batman, orgId);

    await PartReviewService.deleteFaq(faq.faqId, superman, orgId);

    await expect(
      async () => await PartReviewService.updateFaq(faq.faqId, 'some q2', 'some a2', batman, orgId)
    ).rejects.toThrow(new DeletedException('Faq', faq.faqId));
  });

  describe('common mistake endpoints', () => {
    it('creates a common mistake, edits it, and deletes it', async () => {
      const commonMistake = await PartReviewService.createCommonMistake(
        'some title',
        'some description',
        false,
        batman,
        orgId
      );
      const prismaCommonMistake = await prisma.partReviewCommonMistake.findUnique({
        where: {
          partReviewCommonMistakeId: commonMistake.partReviewCommonMistakeId
        }
      });

      expect(prismaCommonMistake?.title).toBe('some title');
      expect(prismaCommonMistake?.description).toBe('some description');
      expect(prismaCommonMistake?.starred).toBe(false);
      expect(prismaCommonMistake?.userCreatedId).toBe(batman.userId);
      expect(prismaCommonMistake?.organizationId).toBe(orgId);
      expect(commonMistake?.title).toBe('some title');
      expect(commonMistake?.description).toBe('some description');
      expect(commonMistake?.starred).toBe(false);

      const updatedCommonMistake = await PartReviewService.updateCommonMistake(
        commonMistake.partReviewCommonMistakeId,
        'some title2',
        'some description2',
        true,
        superman,
        orgId
      );

      const prismaCommonMistake2 = await prisma.partReviewCommonMistake.findUnique({
        where: {
          partReviewCommonMistakeId: commonMistake.partReviewCommonMistakeId
        }
      });

      expect(prismaCommonMistake2?.title).toBe('some title2');
      expect(prismaCommonMistake2?.description).toBe('some description2');
      expect(prismaCommonMistake2?.starred).toBe(true);
      expect(prismaCommonMistake2?.userCreatedId).toBe(batman.userId);
      expect(prismaCommonMistake2?.organizationId).toBe(orgId);
      expect(prismaCommonMistake2?.dateDeleted).toBeFalsy();
      expect(updatedCommonMistake?.title).toBe('some title2');
      expect(updatedCommonMistake?.description).toBe('some description2');
      expect(updatedCommonMistake?.starred).toBe(true);

      const deletedCommonMistake = await PartReviewService.deleteCommonMistake(
        commonMistake.partReviewCommonMistakeId,
        superman,
        orgId
      );
      expect(deletedCommonMistake?.title).toBe('some title2');
      expect(deletedCommonMistake?.description).toBe('some description2');
      expect(deletedCommonMistake?.starred).toBe(true);

      const prismaDeletedMistake = await prisma.partReviewCommonMistake.findUnique({
        where: {
          partReviewCommonMistakeId: commonMistake.partReviewCommonMistakeId
        }
      });
      expect(prismaDeletedMistake?.dateDeleted).toBeTruthy();
    });

    it('does not let non-admins create, edit, or delete common mistakes', async () => {
      await expect(
        async () => await PartReviewService.createCommonMistake('some title', 'some description', false, nonAdmin, orgId)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create common mistake'));

      const commonMistake = await PartReviewService.createCommonMistake(
        'some title',
        'some description',
        false,
        batman,
        orgId
      );

      await expect(
        async () =>
          await PartReviewService.updateCommonMistake(
            commonMistake.partReviewCommonMistakeId,
            'some title2',
            'some description2',
            true,
            nonAdmin,
            orgId
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update common mistake'));

      await expect(
        async () => await PartReviewService.deleteCommonMistake(commonMistake.partReviewCommonMistakeId, nonAdmin, orgId)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('delete common mistake'));
    });

    it('does not allow updating deleted common mistake', async () => {
      const commonMistake = await PartReviewService.createCommonMistake(
        'some title',
        'some description',
        false,
        batman,
        orgId
      );

      await PartReviewService.deleteCommonMistake(commonMistake.partReviewCommonMistakeId, superman, orgId);

      await expect(
        async () =>
          await PartReviewService.updateCommonMistake(
            commonMistake.partReviewCommonMistakeId,
            'some title2',
            'some description2',
            true,
            batman,
            orgId
          )
      ).rejects.toThrow(new DeletedException('common mistake', commonMistake.partReviewCommonMistakeId));
    });
  });

  describe('Get all part tags', () => {
    it('Get all part tags succeeds and returns empty array', async () => {
      const partTags = await PartReviewService.getAllPartTags(orgId);
      expect(partTags).toBeInstanceOf(Array);
      expect(partTags.length).toEqual(0);
    });

    it('Get all part tags succeeds and returns part tags', async () => {
      const org2Creator = await prisma.user.create({
        data: {
          firstName: 'Admin2',
          lastName: 'User2',
          email: 'admin2@gmail.com',
          googleAuthId: 'organizationCreator2'
        }
      });

      const org2 = await prisma.organization.create({
        data: {
          name: 'Joe mama2',
          description: 'Joe mama2`s organization',
          applicationLink: '',
          userCreated: {
            connect: {
              userId: org2Creator.userId
            }
          }
        }
      });

      await prisma.partTag.createMany({
        data: [
          {
            partTagId: '123',
            name: 'Screw',
            colorHexCode: '#191010',
            dateCreated: new Date(),
            organizationId: orgId
          },
          { partTagId: '456', name: 'Bolt', colorHexCode: '#093121', dateCreated: new Date(), organizationId: orgId }
        ]
      });

      // Create a partTag belonging to a different organization
      await prisma.partTag.create({
        data: {
          partTagId: '973',
          name: 'Nut',
          colorHexCode: '#920323',
          dateCreated: new Date(),
          organizationId: org2.organizationId
        }
      });

      // Create a deleted partTag for the same organization
      await prisma.partTag.create({
        data: {
          partTagId: '345',
          name: 'Washer',
          colorHexCode: '#983434',
          dateCreated: new Date(),
          organizationId: orgId,
          dateDeleted: new Date() // Marked as deleted
        }
      });

      const partTags = await PartReviewService.getAllPartTags(orgId);
      expect(partTags.length).toEqual(2);
      expect(partTags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ partTagId: '123', name: 'Screw', colorHexCode: '#191010' }),
          expect.objectContaining({ partTagId: '456', name: 'Bolt', colorHexCode: '#093121' })
        ])
      );

      expect(partTags.some((tag) => tag.partTagId === '345')).toBeFalsy();
      expect(partTags.some((tag) => tag.partTagId === '973')).toBeFalsy();
    });
  });

  describe('Get all part FAQS', () => {
    it('Succeeds and gets all part review FAQS in the organization', async () => {
      const faq1 = await prisma.frequentlyAskedQuestion.create({
        data: {
          faqId: '1',
          question: 'question1',
          answer: 'answer1',
          userCreated: { connect: { userId: batman.userId } },
          dateCreated: new Date(),
          partReviewFaqOrg: { connect: { organizationId: orgId } }
        }
      });
      const faq2 = await prisma.frequentlyAskedQuestion.create({
        data: {
          faqId: '2',
          question: 'question2',
          answer: 'answer2',
          userCreated: { connect: { userId: batman.userId } },
          dateCreated: new Date(),
          partReviewFaqOrg: { connect: { organizationId: orgId } }
        }
      });
      const partReviews = await PartReviewService.getAllPartReviewFAQs(orgId);
      expect(partReviews).toHaveLength(2);
      expect(partReviews[0].question).toEqual(faq1.question);
      expect(partReviews[0].answer).toEqual(faq1.answer);
      expect(partReviews[1].question).toEqual(faq2.question);
      expect(partReviews[1].answer).toEqual(faq2.answer);
    });

    it('Retrieves empty list of part review FAQS in the organization', async () => {
      const partReviews = await PartReviewService.getAllPartReviewFAQs(orgId);
      expect(partReviews).toHaveLength(0);
    });

    it('Does not retrieve regular FAQS in the organization', async () => {
      const partFaq = await prisma.frequentlyAskedQuestion.create({
        data: {
          faqId: '1',
          question: 'faq question',
          answer: 'faq answer',
          userCreated: { connect: { userId: batman.userId } },
          dateCreated: new Date(),
          partReviewFaqOrg: { connect: { organizationId: orgId } }
        }
      });
      const regularFaq = await prisma.frequentlyAskedQuestion.create({
        data: {
          faqId: '2',
          question: 'regular question',
          answer: 'regular answer',
          userCreated: { connect: { userId: batman.userId } },
          dateCreated: new Date(),
          regularFaqOrg: { connect: { organizationId: orgId } }
        }
      });
      const partReviews = await PartReviewService.getAllPartReviewFAQs(orgId);
      expect(partReviews).toHaveLength(1);
      expect(partReviews[0].question).toEqual(partFaq.question);
      expect(partReviews[0].answer).toEqual(partFaq.answer);
      expect(partReviews[0].question).not.toEqual(regularFaq.question);
      expect(partReviews[0].answer).not.toEqual(regularFaq.answer);
    });
  });

  it('gets all common mistakes', async () => {
    const org2Creator = await prisma.user.create({
      data: {
        firstName: 'Admin2',
        lastName: 'User2',
        email: 'admin2@gmail.com',
        googleAuthId: 'organizationCreator2'
      }
    });

    const org2 = await prisma.organization.create({
      data: {
        name: 'Joe mama2',
        description: 'Joe mama2`s organization',
        applicationLink: '',
        userCreated: {
          connect: {
            userId: org2Creator.userId
          }
        }
      }
    });

    const flash = await createTestUser(flashAdmin, org2.organizationId);
    await PartReviewService.createCommonMistake('mistake', 'desc', false, batman, orgId);
    await PartReviewService.createCommonMistake('mistake2', 'desc2', false, flash, org2.organizationId);
    await PartReviewService.createCommonMistake('mistake3', 'desc3', true, batman, orgId);
    await PartReviewService.createCommonMistake('mistake4', 'desc4', false, batman, orgId);

    const commonMistakes = await PartReviewService.getAllCommonMistakes(orgId);
    expect(commonMistakes).toHaveLength(3);
    expect(commonMistakes[0].title).toBe('mistake');
    expect(commonMistakes[1].title).toBe('mistake3');
    expect(commonMistakes[2].title).toBe('mistake4');
    expect(commonMistakes[0].description).toBe('desc');
    expect(commonMistakes[1].description).toBe('desc3');
    expect(commonMistakes[2].description).toBe('desc4');
    expect(commonMistakes[0].starred).toBe(false);
    expect(commonMistakes[1].starred).toBe(true);
    expect(commonMistakes[2].starred).toBe(false);
  });
});
describe('part review popup service tests', () => {
  let orgId: string;
  let batman: User;
  let popupId: string | undefined;

  beforeEach(async () => {
      const organization = await createTestOrganization();
      orgId = organization.organizationId;
      batman = await createTestUser(batmanAppAdmin, orgId);
      await prisma.part_Review_Popup.deleteMany({});
      popupId = (await PartReviewService.createPartReviewPopup(
        'some-orginization-id',
        'some-review-id',
        10,
        20,
        'Test Popup',
        'Popup description',
        batman
    )).partReviewPopupId;
  });

  afterEach(async () => {
      await resetUsers();
  });

  it('creates a popup', async () => {

      const prismaPopup = await prisma.part_Review_Popup.findUnique({ where: { partReviewPopupId: popupId } });

      expect(prismaPopup).toBeDefined();
      expect(prismaPopup?.title).toBe('Test Popup');
      expect(prismaPopup?.description).toBe('Popup description');
  });

  it('updates a popup', async () => {
      if (!popupId) throw new Error('popupId is undefined');
      const updatedPopup = await PartReviewService.updatePartReviewPopup(
          popupId,
          15,
          25,
          'Updated Popup',
          'Updated description',
          batman
      );

      expect(updatedPopup).toBeDefined();
      expect(updatedPopup?.title).toBe('Updated Popup');
      expect(updatedPopup?.description).toBe('Updated description');
  });

  it('deletes a popup', async () => {
      if (!popupId) throw new Error('popupId is undefined');
      const deletedPopup = await PartReviewService.deletePartReviewPopup(popupId, batman);

      expect(deletedPopup).toBeDefined();
      expect(deletedPopup.message).toBe('Popup deleted successfully');

      const prismaPopup = await prisma.part_Review_Popup.findUnique({ where: { partReviewPopupId: popupId } });

      expect(prismaPopup).toBeNull();
  });
})