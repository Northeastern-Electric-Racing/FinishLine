import { Review_Status } from 'shared';
import prisma from '../prisma/prisma';
import PartReviewService from '../services/part-review.services';
import { BenchSpec } from './bench-types';

export const partReviewSpecs: BenchSpec<any>[] = [
  {
    name: 'part-review.getAllPartTags',
    tags: ['part-review', 'read'],
    async prepare(ctx) {
      return { inputs: { organizationId: ctx.organization.organizationId } };
    },
    async run({ organizationId }) {
      await PartReviewService.getAllPartTags(organizationId);
    }
  },
  {
    name: 'part-review.getAllPartReviewFAQs',
    tags: ['part-review', 'read'],
    async prepare(ctx) {
      return { inputs: { organizationId: ctx.organization.organizationId } };
    },
    async run({ organizationId }) {
      await PartReviewService.getAllPartReviewFAQs(organizationId);
    }
  },
  {
    name: 'part-review.getAllCommonMistakes',
    tags: ['part-review', 'read'],
    async prepare(ctx) {
      return { inputs: { organizationId: ctx.organization.organizationId } };
    },
    async run({ organizationId }) {
      await PartReviewService.getAllCommonMistakes(organizationId);
    }
  },
  {
    name: 'part-review.getAllPartsForProject',
    tags: ['part-review', 'read'],
    async prepare(ctx) {
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!proj || !user) return { skip: 'missing project or user' };
      const wbsNumber = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      return { inputs: { wbsNumber, organization: ctx.organization, user } };
    },
    async run({ wbsNumber, organization, user }) {
      await PartReviewService.getAllPartsForProject(wbsNumber, organization, user);
    }
  },
  // Writes — tags, faqs, parts, submissions, reviews, requests, popups
  {
    name: 'part-review.createPartTag',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const creator = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!creator) return { skip: 'no admin' };
      return { inputs: { creator, organizationId: ctx.organization.organizationId } };
    },
    async run({ creator, organizationId }) {
      await PartReviewService.createPartTag(`Bench-Tag-${Date.now()}`, '#123456', creator, organizationId);
    }
  },
  {
    name: 'part-review.updatePartTag',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const updater = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!updater) return { skip: 'no admin' };
      const tag = await prisma.part_Tag.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!tag) return { skip: 'no tag to update' };
      return { inputs: { updater, organizationId: ctx.organization.organizationId, partTagId: tag.partTagId } };
    },
    async run({ updater, organizationId, partTagId }) {
      await PartReviewService.updatePartTag(partTagId, `Edited-${Date.now()}`, '#654321', updater, organizationId);
    }
  },
  {
    name: 'part-review.createFaq',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const creator = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!creator) return { skip: 'no admin' };
      return { inputs: { creator, organizationId: ctx.organization.organizationId } };
    },
    async run({ creator, organizationId }) {
      await PartReviewService.createFaq(`Q ${Date.now()}`, 'A lorem ipsum', creator, organizationId);
    }
  },
  {
    name: 'part-review.updateFaq',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const updater = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!updater) return { skip: 'no admin' };
      let faq = await prisma.frequentlyAskedQuestion.findFirst({
        where: { partReviewFaqOrgId: ctx.organization.organizationId, dateDeleted: null },
        select: { faqId: true }
      });
      if (!faq) {
        const created = await PartReviewService.createFaq(
          `TempQ ${Date.now()}`,
          'TempA',
          updater,
          ctx.organization.organizationId
        );
        faq = { faqId: created.faqId };
      }
      return { inputs: { updater, organizationId: ctx.organization.organizationId, faqId: faq!.faqId } };
    },
    async run({ updater, organizationId, faqId }) {
      await PartReviewService.updateFaq(faqId, `UpdatedQ ${Date.now()}`, 'UpdatedA', updater, organizationId);
    }
  },
  {
    name: 'part-review.deleteFaq',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const deleter = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!deleter) return { skip: 'no admin' };
      return { inputs: { deleter, organizationId: ctx.organization.organizationId } };
    },
    async run({ deleter, organizationId }) {
      const created = await PartReviewService.createFaq(`DelQ ${Date.now()}`, 'DelA', deleter, organizationId);
      await PartReviewService.deleteFaq(created.faqId, deleter, organizationId);
    }
  },
  {
    name: 'part-review.createUpdateDeletePart',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true, teams: { include: { members: true, leads: true, head: true } } }
      });
      if (!proj) return { skip: 'no project' };
      const tag = await prisma.part_Tag.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!tag) return { skip: 'no tag' };
      const [team] = proj.teams;
      const creatorId = team?.head?.userId || team?.leads?.[0]?.userId || team?.members?.[0]?.userId;
      if (!creatorId) return { skip: 'no team member for project' };
      const extraUsers = await prisma.user.findMany({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } }, userId: { not: creatorId } },
        select: { userId: true },
        take: 2
      });
      if (extraUsers.length < 2) return { skip: 'not enough users' };
      const wbsNum = `${proj.wbsElement.carNumber}.${proj.wbsElement.projectNumber}.${proj.wbsElement.workPackageNumber}`;
      return {
        inputs: {
          creatorId,
          organization: ctx.organization,
          wbsNum,
          commonName: `Bench Part ${Date.now()}`,
          description: 'bench part',
          reviewStatus: Review_Status.IN_PROGRESS,
          tagIds: [tag.partTagId],
          assigneeIds: [extraUsers[0].userId],
          reviewerIds: [extraUsers[1].userId]
        }
      };
    },
    async run({ creatorId, organization, wbsNum, commonName, description, reviewStatus, tagIds, assigneeIds, reviewerIds }) {
      const runtimeIndex = Math.floor(Math.random() * 1000000) + 1000;
      const creator = await prisma.user.findUnique({ where: { userId: creatorId } });
      if (!creator) return;
      const created = await PartReviewService.createPart(
        organization,
        wbsNum,
        creator,
        runtimeIndex,
        commonName,
        description,
        reviewStatus,
        tagIds,
        assigneeIds,
        reviewerIds
      );
      const updated = await PartReviewService.updatePart(
        organization.organizationId,
        created.partId,
        creator,
        runtimeIndex,
        commonName + ' edited',
        description + ' edited',
        Review_Status.READY_FOR_REVIEW,
        tagIds,
        assigneeIds,
        reviewerIds
      );
      await PartReviewService.deletePart(updated.partId, creator, organization.organizationId);
    }
  },
  {
    name: 'part-review.createUpdateSubmission',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true, teams: { include: { head: true, leads: true, members: true } } }
      });
      if (!proj) return { skip: 'no project' };
      const tag = await prisma.part_Tag.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!tag) return { skip: 'no tag' };
      const [team] = proj.teams;
      const creatorId = team?.head?.userId || team?.leads?.[0]?.userId || team?.members?.[0]?.userId;
      if (!creatorId) return { skip: 'no team member for project' };
      const wbsNum = `${proj.wbsElement.carNumber}.${proj.wbsElement.projectNumber}.${proj.wbsElement.workPackageNumber}`;
      return { inputs: { creatorId, organization: ctx.organization, wbsNum, tagId: tag.partTagId } };
    },
    async run({ creatorId, organization, wbsNum, tagId }) {
      const creator = await prisma.user.findUnique({ where: { userId: creatorId } });
      if (!creator) return;
      const part = await PartReviewService.createPart(
        organization,
        wbsNum,
        creator,
        Math.floor(Math.random() * 1000000) + 2000,
        `Bench Part ${Date.now()}`,
        'desc',
        Review_Status.APPROVED,
        [tagId],
        [creatorId],
        []
      );
      const submission = await PartReviewService.createSubmission(
        part.partId,
        creator,
        organization.organizationId,
        'sub1',
        ['file1', 'file2']
      );
      await PartReviewService.updateSubmission(
        submission.partSubmissionId,
        creator,
        organization.organizationId,
        'sub1 edited',
        'notes'
      );
    }
  },
  {
    name: 'part-review.createUpdateDeleteReview',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true, teams: { include: { head: true, leads: true, members: true } } }
      });
      if (!proj) return { skip: 'no project' };
      const tag = await prisma.part_Tag.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!tag) return { skip: 'no tag' };
      const [team] = proj.teams;
      const creatorId = team?.head?.userId || team?.leads?.[0]?.userId || team?.members?.[0]?.userId;
      if (!creatorId) return { skip: 'no team member for project' };
      const wbsNum = `${proj.wbsElement.carNumber}.${proj.wbsElement.projectNumber}.${proj.wbsElement.workPackageNumber}`;
      return { inputs: { creatorId, organization: ctx.organization, wbsNum, tagId: tag.partTagId } };
    },
    async run({ creatorId, organization, wbsNum, tagId }) {
      const creator = await prisma.user.findUnique({ where: { userId: creatorId } });
      if (!creator) return;
      const part = await PartReviewService.createPart(
        organization,
        wbsNum,
        creator,
        Math.floor(Math.random() * 1000000) + 3000,
        `Bench Part ${Date.now()}`,
        'desc',
        Review_Status.IN_PROGRESS,
        [tagId],
        [creatorId],
        []
      );
      const submission = await PartReviewService.createSubmission(
        part.partId,
        creator,
        organization.organizationId,
        'sub1',
        ['file1']
      );
      const review = await PartReviewService.createReview(
        organization.organizationId,
        creator,
        submission.partSubmissionId,
        Review_Status.IN_REVIEW,
        ['fileX'],
        'rnotes'
      );
      await PartReviewService.updateReview(
        organization.organizationId,
        creator,
        review.partReviewId,
        Review_Status.REVIEWED,
        'updated',
        ['fileY']
      );
      // delete a non-completed review
      const review2 = await PartReviewService.createReview(
        organization.organizationId,
        creator,
        submission.partSubmissionId,
        Review_Status.IN_REVIEW,
        [],
        'temp'
      );
      await PartReviewService.deleteReview(review2.partReviewId, creator, organization.organizationId);
    }
  },
  {
    name: 'part-review.createAndDeleteReviewRequest',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const requester = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const reviewer = await prisma.user.findFirst({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        select: { userId: true }
      });
      if (!requester || !reviewer) return { skip: 'missing users' };
      const proj = await prisma.project.findFirst({
        where: {
          wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null },
          teams: {
            some: {
              OR: [
                { headId: requester.userId },
                { leads: { some: { userId: requester.userId } } },
                { members: { some: { userId: requester.userId } } }
              ]
            }
          }
        },
        include: { wbsElement: true }
      });
      const tag = await prisma.part_Tag.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!proj || !tag) return { skip: 'no project or tag' };
      const wbsNum = `${proj.wbsElement.carNumber}.${proj.wbsElement.projectNumber}.${proj.wbsElement.workPackageNumber}`;
      return {
        inputs: { requester, reviewerId: reviewer.userId, organization: ctx.organization, wbsNum, tagId: tag.partTagId }
      };
    },
    async run({ requester, reviewerId, organization, wbsNum, tagId }) {
      const part = await PartReviewService.createPart(
        organization,
        wbsNum,
        requester,
        Math.floor(Math.random() * 1000000) + 4000,
        `Bench Part ${Date.now()}`,
        'desc',
        Review_Status.IN_PROGRESS,
        [tagId],
        [requester.userId],
        []
      );
      const pr = await PartReviewService.createPartReviewRequest(
        part.partId,
        requester,
        reviewerId,
        organization.organizationId
      );
      await PartReviewService.deletePartReviewRequest(pr.partReviewRequestId, requester, organization.organizationId);
    }
  },
  {
    name: 'part-review.notifyReviewerAndAssignee',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const creator = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      const other = await prisma.user.findFirst({
        where: {
          organizations: { some: { organizationId: ctx.organization.organizationId } },
          userId: { not: ctx.memberUser.userId }
        },
        select: { userId: true }
      });
      if (!creator || !other) return { skip: 'missing users' };
      const proj = await prisma.project.findFirst({
        where: {
          wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null },
          teams: {
            some: {
              OR: [
                { headId: creator.userId },
                { leads: { some: { userId: creator.userId } } },
                { members: { some: { userId: creator.userId } } }
              ]
            }
          }
        },
        include: { wbsElement: true }
      });
      const tag = await prisma.part_Tag.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!proj || !tag) return { skip: 'no project or tag' };
      const wbsNum = `${proj.wbsElement.carNumber}.${proj.wbsElement.projectNumber}.${proj.wbsElement.workPackageNumber}`;
      return { inputs: { creator, otherId: other.userId, organization: ctx.organization, wbsNum, tagId: tag.partTagId } };
    },
    async run({ creator, otherId, organization, wbsNum, tagId }) {
      const part = await PartReviewService.createPart(
        organization,
        wbsNum,
        creator,
        Math.floor(Math.random() * 1000000) + 5000,
        `Bench Part ${Date.now()}`,
        'desc',
        Review_Status.IN_PROGRESS,
        [tagId],
        [creator.userId],
        [otherId]
      );
      await PartReviewService.notifyReviewer(otherId, part.partId, creator, organization.organizationId);
      await PartReviewService.notifyAssignee(creator.userId, part.partId, creator, organization.organizationId);
    }
  },
  {
    name: 'part-review.createUpdateDeletePopup',
    tags: ['part-review', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin' };
      const proj = await prisma.project.findFirst({
        where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
        include: { wbsElement: true }
      });
      const tag = await prisma.part_Tag.findFirst({ where: { organizationId: ctx.organization.organizationId } });
      if (!proj || !tag) return { skip: 'no project or tag' };
      const wbsNum = `${proj.wbsElement.carNumber}.${proj.wbsElement.projectNumber}.${proj.wbsElement.workPackageNumber}`;
      return { inputs: { admin, organization: ctx.organization, wbsNum, tagId: tag.partTagId } };
    },
    async run({ admin, organization, wbsNum, tagId }) {
      const part = await PartReviewService.createPart(
        organization,
        wbsNum,
        admin,
        Math.floor(Math.random() * 1000000) + 6000,
        `Bench Part ${Date.now()}`,
        'desc',
        Review_Status.IN_PROGRESS,
        [tagId],
        [admin.userId],
        []
      );
      const submission = await PartReviewService.createSubmission(part.partId, admin, organization.organizationId, 'subX', [
        'f1'
      ]);
      const review = await PartReviewService.createReview(
        organization.organizationId,
        admin,
        submission.partSubmissionId,
        Review_Status.IN_REVIEW,
        [],
        'r'
      );
      const popup = await PartReviewService.createPartReviewPopup(
        organization.organizationId,
        review.partReviewId,
        10,
        20,
        0,
        't',
        'd',
        admin
      );
      await PartReviewService.updatePartReviewPopup(
        organization.organizationId,
        popup.partReviewPopupId,
        15,
        25,
        1,
        't2',
        'd2',
        admin
      );
      await PartReviewService.deletePartReviewPopup(popup.partReviewPopupId, admin, organization.organizationId);
    }
  }
];
