import { PartReviewCommonMistake, Prisma } from '@prisma/client';
import {
  PartReviewCommonMistake as SharedCommonMistake,
  Part,
  Review_Status,
  PartSubmission,
  PartReviewRequest,
  PartReview,
  PartPreview
} from 'shared';
import {
  PartQueryArgs,
  PartReviewQueryArgs,
  PartReviewRequestQueryArgs,
  PartSubmissionQueryArgs
} from '../prisma-query-args/part-review.query-args';
import { userTransformer } from './user.transformer';

export const partsReviewCommonMistakeTransformer = (commonMistake: PartReviewCommonMistake): SharedCommonMistake => {
  return commonMistake;
};

export const partTransformer = (part: Prisma.PartGetPayload<PartQueryArgs>): Part => {
  return {
    ...partPreviewTransformer(part),
    submissions: part.submissions.map(partSubmissionTransformer)
  };
};

export const partPreviewTransformer = (part: Prisma.PartGetPayload<PartQueryArgs>): PartPreview => {
  return {
    partId: part.partId,
    index: part.index,
    commonName: part.commonName,
    description: part.description ?? undefined,
    previewImageId: part.previewImageId ?? undefined,
    status: part.status as Review_Status,
    tags: part.tags,
    projectId: part.projectId,
    assignees: part.assignees.map(userTransformer),
    reviewRequests: part.reviewRequests.map(partReviewRequestTransformer),
    userCreated: userTransformer(part.userCreated),
    createdAt: part.createdAt
  };
};

export const partSubmissionTransformer = (
  submission: Prisma.PartSubmissionGetPayload<PartSubmissionQueryArgs>
): PartSubmission => {
  return {
    partSubmissionId: submission.partSubmissionId,
    fileIds: submission.fileIds,
    name: submission.name,
    notes: submission.notes ?? undefined,
    partId: submission.partId,
    userCreated: userTransformer(submission.userCreated),
    reviews: submission.reviews.map(partReviewTransformer),
    createdAt: submission.createdAt
  };
};

export const partReviewRequestTransformer = (
  reviewRequest: Prisma.PartReviewRequestGetPayload<PartReviewRequestQueryArgs>
): PartReviewRequest => {
  return {
    partReviewRequestId: reviewRequest.partReviewRequestId,
    partId: reviewRequest.partId,
    requester: userTransformer(reviewRequest.requester),
    reviewerRequested: userTransformer(reviewRequest.reviewerRequested),
    createdAt: reviewRequest.createdAt,
    dateDeleted: reviewRequest.dateDeleted ?? undefined
  };
};

export const partReviewTransformer = (review: Prisma.PartReviewGetPayload<PartReviewQueryArgs>): PartReview => {
  return {
    partReviewId: review.partReviewId,
    fileIds: review.fileIds,
    notes: review.notes ?? undefined,
    submissionId: review.submissionId,
    popUps: review.popUps,
    completedAt: review.completedAt ?? undefined,
    createdAt: review.createdAt,
    userCreated: userTransformer(review.userCreated)
  };
};
