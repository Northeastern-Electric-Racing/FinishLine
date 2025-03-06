import { PartReviewCommonMistake, Prisma } from '@prisma/client';
import {
  PartReviewCommonMistake as SharedCommonMistake,
  Part as SharedPart,
  Review_Status,
  PartSubmission as sharedSubmission,
  PartReviewRequest as sharedReviewRequest,
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

export const partTransformer = (part: Prisma.PartGetPayload<PartQueryArgs>): SharedPart => {
  return {
    ...partPreviewTransformer(part),
    submissions: part.submissions.map(submissionTransformer)
  };
};

export const partPreviewTransformer = (part: Prisma.PartGetPayload<PartQueryArgs>): PartPreview => {
  return {
    partId: part.partId,
    index: part.index,
    commonName: part.commonName,
    description: part.description ?? undefined,
    previewImageLink: part.previewImageLink ?? undefined,
    status: part.status as Review_Status,
    tags: part.tags,
    projectId: part.projectId,
    assignees: part.assignees.map(userTransformer),
    reviewers: part.submissions
      .map((submission) =>
        submission.reviewRequests
          .map((reviewReq) => reviewReq.reviewerRequested)
          .flat()
          .concat(submission.reviews.map((review) => review.userCreated).flat())
      )
      .flat()
      .map(userTransformer),
    userCreated: userTransformer(part.userCreated),
    createdAt: part.createdAt
  };
};

export const submissionTransformer = (
  submission: Prisma.PartSubmissionGetPayload<PartSubmissionQueryArgs>
): sharedSubmission => {
  return {
    partSubmissionId: submission.partSubmissionId,
    fileIds: submission.fileIds,
    name: submission.name,
    notes: submission.notes ?? undefined,
    partId: submission.partId,
    userCreated: userTransformer(submission.userCreated),
    reviewRequests: submission.reviewRequests.map(partReviewRequestTransformer),
    reviews: submission.reviews.map(partReviewTransformer)
  };
};

export const partReviewRequestTransformer = (
  reviewRequest: Prisma.PartReviewRequestGetPayload<PartReviewRequestQueryArgs>
): sharedReviewRequest => {
  return {
    partReviewRequestId: reviewRequest.partReviewRequestId,
    submissionId: reviewRequest.submissionId,
    requester: userTransformer(reviewRequest.requester),
    reviewerRequested: userTransformer(reviewRequest.reviewerRequested),
    createdAt: reviewRequest.createdAt
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
