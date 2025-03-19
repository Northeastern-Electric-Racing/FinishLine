import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type PartQueryArgs = ReturnType<typeof partQueryArgs>;
export type PartSubmissionQueryArgs = ReturnType<typeof partSubmissionQueryArgs>;
export type PartReviewQueryArgs = ReturnType<typeof partReviewQueryArgs>;
export type PartReviewRequestQueryArgs = ReturnType<typeof partReviewRequestQueryArgs>;

export const partQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.PartDefaultArgs>()({
    include: {
      tags: true,
      submissions: partSubmissionQueryArgs(organizationId),
      assignees: getUserQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId)
    }
  });

export const partSubmissionQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.PartSubmissionDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      reviewRequests: partReviewRequestQueryArgs(organizationId),
      reviews: partReviewQueryArgs(organizationId)
    }
  });

export const partReviewRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.PartReviewRequestDefaultArgs>()({
    include: {
      requester: getUserQueryArgs(organizationId),
      reviewerRequested: getUserQueryArgs(organizationId)
    }
  });

export const partReviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.PartReviewDefaultArgs>()({
    include: {
      popUps: true,
      userCreated: getUserQueryArgs(organizationId)
    }
  });