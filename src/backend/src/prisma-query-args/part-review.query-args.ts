import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type PartQueryArgs = ReturnType<typeof getPartQueryArgs>;
export type PartSubmissionQueryArgs = ReturnType<typeof getPartSubmissionQueryArgs>;
export type PartReviewQueryArgs = ReturnType<typeof getPartReviewQueryArgs>;
export type PartReviewRequestQueryArgs = ReturnType<typeof getPartReviewRequestQueryArgs>;

export const getPartQueryArgs = (organizationId: string, userId: string) =>
  Prisma.validator<Prisma.PartDefaultArgs>()({
    include: {
      tags: true,
      submissions: { where: { dateDeleted: null }, ...getPartSubmissionQueryArgs(organizationId, userId) },
      reviewRequests: { where: { dateDeleted: null }, ...getPartReviewRequestQueryArgs(organizationId) },
      assignees: getUserQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId),
      project: { include: { wbsElement: true } }
    }
  });

export const getPartSubmissionQueryArgs = (organizationId: string, userId: string) =>
  Prisma.validator<Prisma.Part_SubmissionDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      reviews: {
        where: { dateDeleted: null, OR: [{ NOT: { completedAt: null } }, { userCreatedId: userId }] },
        ...getPartReviewQueryArgs(organizationId)
      }
    }
  });

export const getPartReviewRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Part_Review_RequestDefaultArgs>()({
    include: {
      requester: getUserQueryArgs(organizationId),
      reviewerRequested: getUserQueryArgs(organizationId)
    }
  });

export const getPartReviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Part_ReviewDefaultArgs>()({
    include: {
      popUps: { where: { deletedAt: null } },
      userCreated: getUserQueryArgs(organizationId)
    }
  });
