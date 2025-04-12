import { Organization, User } from '@prisma/client';
import {
  createMinimalPartReview,
  createMinimalPartReviewForReview,
  createTestCar,
  createTestOrganization,
  createTestPart,
  createTestProject,
  createTestTeam,
  createTestTeamType,
  createTestUser,
  resetUsers
} from '../test-utils';
import PartReviewService from '../../src/services/part-review.services';
import { batmanAppAdmin, supermanAdmin, aquamanLeadership, flashAdmin, financeMember } from '../test-data/users.test-data';
import prisma from '../../src/prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  NotFoundException
} from '../../src/utils/errors.utils';
import { validateWBS, WbsNumber } from 'shared';
import { Review_Status } from 'shared';

describe('part review tests', () => {
  let orgId: string;
  let organization: Organization;
  let batman: User;
  let superman: User;
  let nonAdmin: User;
  let nonLeadership: User;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    batman = await createTestUser(batmanAppAdmin, orgId);
    superman = await createTestUser(supermanAdmin, orgId);
    nonAdmin = await createTestUser(aquamanLeadership, orgId);
    nonLeadership = await createTestUser(financeMember, orgId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('creates a part, updates it, and deletes it', async () => {
    const project = await createTestProject(batman, orgId);

    const project1 = await prisma.project.findUnique({
      where: { projectId: project.projectId },
      include: {
        wbsElement: true
      }
    });

    const wbsNum = `${project1?.wbsElement.carNumber}.${project1?.wbsElement.projectNumber}.${project1?.wbsElement.workPackageNumber}`;

    const tag = await PartReviewService.createPartTag('practice', '#000000', superman, orgId);
    const tag2 = await PartReviewService.createPartTag('practice1', '#000001', superman, orgId);
    const tag3 = await PartReviewService.createPartTag('practice2', '#000002', superman, orgId);

    const part = await PartReviewService.createPart(
      organization,
      wbsNum,
      batman,
      1,
      'part1',
      'here is a description',
      Review_Status.IN_PROGRESS,
      [tag.partTagId, tag3.partTagId],
      [nonAdmin.userId, batman.userId]
    );

    expect(part.commonName).toBe('part1');
    expect(part.description).toBe('here is a description');
    expect(part.userCreated.userId).toBe(batman.userId);
    expect(part.status).toBe('IN_PROGRESS');
    expect(part.tags.map((tag) => tag.partTagId)).toHaveLength(2);
    expect(part.tags.map((tag) => tag.partTagId)).toContain(tag.partTagId);
    expect(part.tags.map((tag) => tag.partTagId)).toContain(tag3.partTagId);
    expect(part.assignees).toHaveLength(2);
    expect(part.assignees.map((user) => user.userId)).toContain(nonAdmin.userId);
    expect(part.assignees.map((user) => user.userId)).toContain(batman.userId);

    const updatedPart = await PartReviewService.updatePart(
      orgId,
      part.partId,
      superman,
      2,
      'part2',
      'new description',
      Review_Status.IN_REVIEW,
      [tag2.partTagId],
      [superman.userId, nonAdmin.userId]
    );

    expect(updatedPart.commonName).toBe('part2');
    expect(updatedPart.description).toBe('new description');
    expect(updatedPart.userCreated.userId).toBe(batman.userId);
    expect(updatedPart.status).toBe('IN_REVIEW');
    expect(updatedPart.tags.map((tag) => tag.partTagId)).toHaveLength(1);
    expect(updatedPart.tags.map((tag) => tag.partTagId)).toContain(tag2.partTagId);
    expect(updatedPart.assignees).toHaveLength(2);
    expect(updatedPart.assignees.map((user) => user.userId)).toContain(superman.userId);
    expect(updatedPart.assignees.map((user) => user.userId)).toContain(nonAdmin.userId);

    const deletedPart = await PartReviewService.deletePart(updatedPart.partId, batman, orgId);
    expect(deletedPart.commonName).toBe('part2');
    expect(deletedPart.description).toBe('new description');
    expect(deletedPart.userCreated.userId).toBe(batman.userId);
    expect(deletedPart.status).toBe('IN_REVIEW');
    expect(deletedPart.tags.map((tag) => tag.partTagId)).toHaveLength(1);
    expect(deletedPart.tags.map((tag) => tag.partTagId)).toContain(tag2.partTagId);
    expect(deletedPart.assignees).toHaveLength(2);
    expect(deletedPart.assignees.map((user) => user.userId)).toContain(superman.userId);
    expect(deletedPart.assignees.map((user) => user.userId)).toContain(nonAdmin.userId);

    await expect(
      async () =>
        await PartReviewService.updatePart(
          orgId,
          part.partId,
          superman,
          2,
          'part2',
          'new description',
          Review_Status.IN_REVIEW,
          [tag2.partTagId],
          [superman.userId, nonAdmin.userId]
        )
    ).rejects.toThrow(new DeletedException('Part', part.partId));
  });

  it('Does not allow non-leadership or non-team members to create or update a part', async () => {
    const project = await createTestProject(batman, orgId);

    const project1 = await prisma.project.findUnique({
      where: { projectId: project.projectId },
      include: {
        wbsElement: true
      }
    });

    const wbsNum = `${project1?.wbsElement.carNumber}.${project1?.wbsElement.projectNumber}.${project1?.wbsElement.workPackageNumber}`;

    await expect(
      async () =>
        await PartReviewService.createPart(
          organization,
          wbsNum,
          nonLeadership,
          1,
          'part1',
          'here is a description',
          Review_Status.IN_PROGRESS,
          [],
          [nonAdmin.userId, batman.userId]
        )
    ).rejects.toThrow(new AccessDeniedException('Only leadership and team members can create a part'));

    const part = await PartReviewService.createPart(
      organization,
      wbsNum,
      batman,
      1,
      'part1',
      'here is a description',
      Review_Status.IN_PROGRESS,
      [],
      [nonAdmin.userId, batman.userId]
    );

    await expect(
      async () =>
        await PartReviewService.updatePart(
          orgId,
          part.partId,
          nonLeadership,
          2,
          'part2',
          'new description',
          Review_Status.IN_REVIEW,
          [],
          [superman.userId, nonAdmin.userId]
        )
    ).rejects.toThrow(new AccessDeniedException('Only leadership and the part creator can update part data'));
  });

  it('Does not allow non-leadership to delete parts, or non-existant/deleted parts to be deleted', async () => {
    const project = await createTestProject(batman, orgId);

    const project1 = await prisma.project.findUnique({
      where: { projectId: project.projectId },
      include: {
        wbsElement: true
      }
    });

    const wbsNum = `${project1?.wbsElement.carNumber}.${project1?.wbsElement.projectNumber}.${project1?.wbsElement.workPackageNumber}`;

    const part = await PartReviewService.createPart(
      organization,
      wbsNum,
      batman,
      1,
      'part1',
      'here is a description',
      Review_Status.IN_PROGRESS,
      [],
      [nonAdmin.userId, batman.userId]
    );

    await expect(async () => await PartReviewService.deletePart(part.partId, nonLeadership, orgId)).rejects.toThrow(
      new AccessDeniedException('Only leadership and the part creator can delete a part')
    );

    await PartReviewService.deletePart(part.partId, superman, orgId);

    await expect(async () => await PartReviewService.deletePart(part.partId, batman, orgId)).rejects.toThrow(
      new DeletedException('Part', part.partId)
    );

    await expect(
      async () => await PartReviewService.deletePart('some id that does not exist', batman, orgId)
    ).rejects.toThrow(new NotFoundException('Part', 'some id that does not exist'));
  });

  it('creates a review and updates it', async () => {
    const project = await createTestProject(batman, orgId);

    const project1 = await prisma.project.findUnique({
      where: { projectId: project.projectId },
      include: {
        wbsElement: true
      }
    });

    const wbsNum = `${project1?.wbsElement.carNumber}.${project1?.wbsElement.projectNumber}.${project1?.wbsElement.workPackageNumber}`;

    const part = await PartReviewService.createPart(
      organization,
      wbsNum,
      batman,
      1,
      'part1',
      'here is a description',
      Review_Status.IN_PROGRESS,
      [],
      [nonAdmin.userId, batman.userId]
    );

    const submission = await prisma.partSubmission.create({
      data: {
        part: { connect: { partId: part.partId } },
        userCreated: { connect: { userId: batman.userId } },
        name: 'testName'
      }
    });

    const review = await PartReviewService.createReview(
      orgId,
      batman,
      submission.partSubmissionId,
      'IN_REVIEW',
      'notes about review'
    );

    const reviewWithProject = await prisma.partReview.findUnique({
      where: { partReviewId: review.partReviewId },
      include: { submission: { include: { part: true } } }
    });

    expect(review.notes).toBe('notes about review');
    expect(review.submissionId).toBe(submission.partSubmissionId);
    expect(review.userCreated.userId).toBe(batman.userId);
    expect(review.completedAt).toBeUndefined();
    expect(reviewWithProject?.submission.part.status).toBe(Review_Status.IN_REVIEW);

    const updatedReview = await PartReviewService.updateReview(
      orgId,
      batman,
      review.partReviewId,
      'REVIEWED',
      'updated Notes'
    );
    const reviewWithProject2 = await prisma.partReview.findUnique({
      where: { partReviewId: review.partReviewId },
      include: { submission: { include: { part: true } } }
    });
    expect(updatedReview.notes).toBe('updated Notes');
    expect(updatedReview.submissionId).toBe(submission.partSubmissionId);
    expect(updatedReview.userCreated.userId).toBe(batman.userId);
    expect(updatedReview.completedAt).toBe(new Date());
    expect(reviewWithProject2?.submission.part.status).toBe(Review_Status.REVIEWED);
  });

  it('does not allow non-creators to edit reviews, checks for non-existent and deleted reviews', async () => {
    const project = await createTestProject(batman, orgId);

    const project1 = await prisma.project.findUnique({
      where: { projectId: project.projectId },
      include: {
        wbsElement: true
      }
    });

    const wbsNum = `${project1?.wbsElement.carNumber}.${project1?.wbsElement.projectNumber}.${project1?.wbsElement.workPackageNumber}`;

    const part = await PartReviewService.createPart(
      organization,
      wbsNum,
      batman,
      1,
      'part1',
      'here is a description',
      Review_Status.IN_PROGRESS,
      [],
      [nonAdmin.userId, batman.userId]
    );

    const submission = await prisma.partSubmission.create({
      data: {
        part: { connect: { partId: part.partId } },
        userCreated: { connect: { userId: batman.userId } },
        name: 'testName'
      }
    });

    await expect(
      async () => await PartReviewService.createReview(orgId, batman, 'not a submission id', 'REVIEWED', 'notes')
    ).rejects.toThrow(new NotFoundException('Part Submission', 'not a submission id'));

    await expect(
      async () => await PartReviewService.updateReview(orgId, batman, 'not a review id', 'REVIEWED', 'new notes')
    ).rejects.toThrow(new NotFoundException('Part Review', 'not a review id'));

    const review = await PartReviewService.createReview(
      orgId,
      batman,
      submission.partSubmissionId,
      'REVIEWED',
      'notes about review'
    );

    await expect(
      async () => await PartReviewService.updateReview(orgId, superman, review.partReviewId, 'REVIEWED', 'test notes')
    ).rejects.toThrow(new AccessDeniedException('only review creators can update reviews'));
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
      ).rejects.toThrow(new DeletedException('Common Mistake', commonMistake.partReviewCommonMistakeId));
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

  describe('part review request endpoints', () => {
    let orgId: string;
    let batman: User;
    let superman: User;
    let aquaman: User;
    let partId: string;

    beforeEach(async () => {
      await resetUsers();
      const organization = await createTestOrganization();
      orgId = organization.organizationId;
      batman = await createTestUser(batmanAppAdmin, orgId);
      superman = await createTestUser(supermanAdmin, orgId);
      aquaman = await createTestUser(aquamanLeadership, orgId);

      ({ partId } = await createMinimalPartReviewForReview(batman, orgId));
    });

    afterEach(async () => {
      await resetUsers();
    });

    it('creates a review request successfully', async () => {
      const reviewRequest = await PartReviewService.createPartReviewRequest(partId, batman, superman.userId, orgId);

      const prismaRequest = await prisma.partReviewRequest.findUnique({
        where: { partReviewRequestId: reviewRequest.partReviewRequestId }
      });

      expect(reviewRequest.requester.userId).toBe(batman.userId);
      expect(reviewRequest.reviewerRequested.userId).toBe(superman.userId);
      expect(prismaRequest?.dateDeleted).toBeNull();
    });

    it('fails to create review request if part does not exist', async () => {
      const fakePartId = 'non-existent-part-id';

      await expect(PartReviewService.createPartReviewRequest(fakePartId, aquaman, superman.userId, orgId)).rejects.toThrow(
        new NotFoundException('Part', fakePartId)
      );
    });

    it('requester can delete their review request', async () => {
      const request = await PartReviewService.createPartReviewRequest(partId, batman, superman.userId, orgId);
      const deleted = await PartReviewService.deletePartReviewRequest(request.partReviewRequestId, batman, orgId);
      const prismaDeleted = await prisma.partReviewRequest.findFirst({
        where: { partReviewRequestId: request.partReviewRequestId }
      });
      expect(deleted).toBeDefined();
      expect(prismaDeleted?.dateDeleted).toBeTruthy();
    });

    it('reviewer can delete the review request', async () => {
      const request = await PartReviewService.createPartReviewRequest(partId, batman, superman.userId, orgId);
      const deleted = await PartReviewService.deletePartReviewRequest(request.partReviewRequestId, superman, orgId);
      const prismaDeleted = await prisma.partReviewRequest.findFirst({
        where: { partReviewRequestId: request.partReviewRequestId }
      });
      expect(deleted).toBeDefined();
      expect(prismaDeleted?.dateDeleted).toBeTruthy();
    });

    it('admin can delete the review request', async () => {
      const flash = await createTestUser(flashAdmin, orgId);
      const request = await PartReviewService.createPartReviewRequest(partId, batman, superman.userId, orgId);
      const deleted = await PartReviewService.deletePartReviewRequest(request.partReviewRequestId, flash, orgId);
      const prismaDeleted = await prisma.partReviewRequest.findFirst({
        where: { partReviewRequestId: request.partReviewRequestId }
      });
      expect(deleted).toBeDefined();
      expect(prismaDeleted?.dateDeleted).toBeTruthy();
    });

    it('fails to delete review request if it does not exist', async () => {
      const fakePartId = 'non-existent-part-id';

      await expect(PartReviewService.deletePartReviewRequest(fakePartId, batman, orgId)).rejects.toThrow(
        new NotFoundException('Review Request', fakePartId)
      );
    });
  });

  describe('Get a singular part', () => {
    it('successfully gets the part corresponding to the partId', async () => {
      const division = await createTestTeamType(undefined, orgId);
      const team = await createTestTeam(batman.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, batman.userId);

      const project = await createTestProject(batman, orgId, team.teamId, car.carId, 1);
      const project1 = await prisma.project.findUnique({
        where: { projectId: project.projectId },
        include: {
          wbsElement: true
        }
      });

      const part = await createTestPart(superman, 'door', '1', 1, project.projectId);

      const testPart = await PartReviewService.getPart(organization, project1?.wbsElement as WbsNumber, '1');

      expect(testPart.userCreated.userId).toEqual(part.userCreatedId);
      expect(testPart.commonName).toBe(part.commonName);
      expect(testPart.partId).toBe(part.partId);
      expect(testPart.index).toBe(part.index);
      expect(testPart.projectId).toBe(part.projectId);
    });

    it('throws an error when a part cannot be found with the given partId', async () => {
      const division = await createTestTeamType(undefined, orgId);
      const team = await createTestTeam(batman.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, batman.userId);

      const project = await createTestProject(batman, orgId, team.teamId, car.carId, 1);
      const project1 = await prisma.project.findUnique({
        where: { projectId: project.projectId },
        include: {
          wbsElement: true
        }
      });
      const wbsNum = project1?.wbsElement as WbsNumber;

      await expect(PartReviewService.getPart(organization, wbsNum, '1')).rejects.toThrow(
        new NotFoundException('Part', `projectId: ${project.projectId} and index number: 1`)
      );
    });
  });

  describe('Get all parts', () => {
    it('getting all parts from a project with no parts successfully returns empty array', async () => {
      const division = await createTestTeamType(undefined, orgId);
      const team1 = await createTestTeam(batman.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, batman.userId);

      // Create a project with no parts
      await createTestProject(batman, orgId, team1.teamId, car.carId, 4);

      const proj1WbsNum = validateWBS('0.4.0');

      const parts = await PartReviewService.getAllPartsForProject(proj1WbsNum, organization);

      expect(parts).toBeInstanceOf(Array);
      expect(parts.length).toEqual(0);
    });

    it('gets all parts for the correct project', async () => {
      const division = await createTestTeamType(undefined, orgId);
      const team1 = await createTestTeam(batman.userId, division.teamTypeId, orgId);
      const team2 = await createTestTeam(superman.userId, division.teamTypeId, orgId);
      const car = await createTestCar(orgId, batman.userId);

      const project1 = await createTestProject(batman, orgId, team1.teamId, car.carId, 1);
      const project2 = await createTestProject(superman, orgId, team2.teamId, car.carId, 2);

      const proj1WbsNum = validateWBS('0.1.0');
      const proj2WbsNum = validateWBS('0.2.0');

      const part1 = await createTestPart(batman, 'part1', '1', 1, project1.projectId);
      const part2 = await createTestPart(batman, 'part2', '2', 2, project1.projectId);

      const part3 = await createTestPart(superman, 'part3', '3', 3, project2.projectId);

      const parts1 = await PartReviewService.getAllPartsForProject(proj1WbsNum, organization);
      expect(parts1).toHaveLength(2);
      expect(parts1[0].userCreated.userId).toEqual(part1.userCreatedId);
      expect(parts1[0].commonName).toBe(part1.commonName);
      expect(parts1[0].partId).toBe(part1.partId);
      expect(parts1[0].index).toBe(part1.index);
      expect(parts1[0].projectId).toBe(part1.projectId);

      expect(parts1[1].commonName).toBe(part2.commonName);
      expect(parts1[1].commonName).toBe(part2.commonName);
      expect(parts1[1].partId).toBe(part2.partId);
      expect(parts1[1].index).toBe(part2.index);
      expect(parts1[1].projectId).toBe(part2.projectId);

      const parts2 = await PartReviewService.getAllPartsForProject(proj2WbsNum, organization);
      expect(parts2).toHaveLength(1);
      expect(parts2[0].userCreated.userId).toEqual(part3.userCreatedId);
      expect(parts2[0].commonName).toBe(part3.commonName);
      expect(parts2[0].partId).toBe(part3.partId);
      expect(parts2[0].index).toBe(part3.index);
      expect(parts2[0].projectId).toBe(part3.projectId);
    });
  });
});

describe('Part Review Popups', () => {
  let orgId: string;
  let batman: User;
  let superman: User;
  let nonAdmin: User;

  beforeEach(async () => {
    const organization = await createTestOrganization();
    orgId = organization.organizationId;
    batman = await createTestUser(batmanAppAdmin, orgId);
    superman = await createTestUser(supermanAdmin, orgId);
    nonAdmin = await createTestUser(aquamanLeadership, orgId);
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('creates, updates, and deletes a popup', async () => {
    const review = await createMinimalPartReview(batman, orgId);

    const popup = await PartReviewService.createPartReviewPopup(
      orgId,
      review.partReviewId,
      10,
      20,
      'Initial Title',
      'Initial Description',
      batman
    );

    expect(popup.title).toBe('Initial Title');
    expect(popup.description).toBe('Initial Description');
    expect(popup.xCoord).toBe(10);
    expect(popup.yCoord).toBe(20);

    const updated = await PartReviewService.updatePartReviewPopup(
      orgId,
      popup.partReviewPopupId,
      30,
      40,
      'Updated Title',
      'Updated Description',
      superman
    );

    expect(updated.title).toBe('Updated Title');
    expect(updated.description).toBe('Updated Description');
    expect(updated.xCoord).toBe(30);
    expect(updated.yCoord).toBe(40);

    const deleted = await PartReviewService.deletePartReviewPopup(popup.partReviewPopupId, superman, orgId);

    expect(deleted.partReviewPopupId).toBe(popup.partReviewPopupId);
    expect(deleted.deletedAt).toBeTruthy();

    const prismaDeleted = await prisma.part_Review_Popup.findUnique({
      where: { partReviewPopupId: popup.partReviewPopupId }
    });

    expect(prismaDeleted?.deletedAt).toBeTruthy();
  });

  it('blocks non-admins from creating, updating, or deleting popups', async () => {
    const review = await createMinimalPartReview(batman, orgId);

    await expect(
      PartReviewService.createPartReviewPopup(orgId, review.partReviewId, 0, 0, 'title', 'desc', nonAdmin)
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('create part review popup'));

    const popup = await PartReviewService.createPartReviewPopup(orgId, review.partReviewId, 1, 2, 'x', 'x', batman);

    await expect(
      PartReviewService.updatePartReviewPopup(orgId, popup.partReviewPopupId, 2, 3, 'fail', 'fail', nonAdmin)
    ).rejects.toThrow(new AccessDeniedAdminOnlyException('update part review popup'));

    await expect(PartReviewService.deletePartReviewPopup(popup.partReviewPopupId, nonAdmin, orgId)).rejects.toThrow(
      new AccessDeniedAdminOnlyException('delete part review popup')
    );
  });

  it('throws NotFoundException if review does not exist or is deleted', async () => {
    await expect(
      PartReviewService.createPartReviewPopup(orgId, 'non-existent-review', 0, 0, 'x', 'x', batman)
    ).rejects.toThrow(new NotFoundException('Part Review', 'non-existent-review'));
  });

  it('throws NotFoundException if popup is deleted before update', async () => {
    const review = await createMinimalPartReview(batman, orgId);

    const popup = await PartReviewService.createPartReviewPopup(
      orgId,
      review.partReviewId,
      1,
      2,
      'Delete Me',
      'Please',
      batman
    );

    await PartReviewService.deletePartReviewPopup(popup.partReviewPopupId, superman, orgId);

    await expect(
      PartReviewService.updatePartReviewPopup(orgId, popup.partReviewPopupId, 10, 10, 'Should Fail', 'Nope', superman)
    ).rejects.toThrow(new NotFoundException('Pop Up', popup.partReviewPopupId));
  });
});
