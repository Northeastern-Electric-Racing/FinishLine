import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type PartQueryArgs = ReturnType<typeof getPartQueryArgs>;
export type PartSubmissionQueryArgs = ReturnType<typeof getPartSubmissionQueryArgs>;
export type PartReviewQueryArgs = ReturnType<typeof getPartReviewQueryArgs>;
export type PartReviewRequestQueryArgs = ReturnType<typeof getPartReviewRequestQueryArgs>;

export const getPartQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.PartDefaultArgs>()({
    include: {
      tags: true,
      submissions: getPartSubmissionQueryArgs(organizationId),
      reviewRequests: getPartReviewRequestQueryArgs(organizationId),
      assignees: getUserQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId)
    }
  });

export const getPartSubmissionQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.PartSubmissionDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      reviews: getPartReviewQueryArgs(organizationId)
    }
  });

export const getPartReviewRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.PartReviewRequestDefaultArgs>()({
    include: {
      requester: getUserQueryArgs(organizationId),
      reviewerRequested: getUserQueryArgs(organizationId)
    }
  });

export const getPartReviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.PartReviewDefaultArgs>()({
    include: {
      popUps: true,
      userCreated: getUserQueryArgs(organizationId)
    }
  });
