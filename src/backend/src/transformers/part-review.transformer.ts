import { Part_Review_Common_Mistake, Prisma } from '@prisma/client';
import {
  PartReviewCommonMistake as SharedCommonMistake,
  Part,
  Review_Status,
  PartSubmission,
  PartReviewRequest,
  PartReview,
  PartPreview,
  Part_Review_Popup,
  PartTag
} from 'shared';
import {
  PartQueryArgs,
  PartReviewQueryArgs,
  PartReviewRequestQueryArgs,
  PartSubmissionQueryArgs
} from '../prisma-query-args/part-review.query-args.js';
import { userTransformer } from './user.transformer.js';

export const partsReviewCommonMistakeTransformer = (commonMistake: Part_Review_Common_Mistake): SharedCommonMistake => {
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
    createdAt: part.createdAt,
    submissions: part.submissions.map((submission) => ({
      partSubmissionId: submission.partSubmissionId,
      name: submission.name
    }))
  };
};

export const partSubmissionTransformer = (
  submission: Prisma.Part_SubmissionGetPayload<PartSubmissionQueryArgs>
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
  reviewRequest: Prisma.Part_Review_RequestGetPayload<PartReviewRequestQueryArgs>
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

export const partReviewTransformer = (review: Prisma.Part_ReviewGetPayload<PartReviewQueryArgs>): PartReview => {
  return {
    partReviewId: review.partReviewId,
    fileIds: review.fileIds,
    notes: review.notes ?? undefined,
    submissionId: review.submissionId,
    popUps: review.popUps.map(partReviewPopupTransformer),
    completedAt: review.completedAt ?? undefined,
    createdAt: review.createdAt,
    userCreated: userTransformer(review.userCreated)
  };
};

export const partReviewPopupTransformer = (popup: Prisma.Part_Review_PopupGetPayload<null>): Part_Review_Popup => {
  return {
    partReviewPopupId: popup.partReviewPopupId,
    xCoord: popup.xCoord,
    yCoord: popup.yCoord,
    fileIndex: popup.fileIndex,
    title: popup.title,
    description: popup.description ?? undefined,
    reviewId: popup.reviewId
  };
};

export const partTagTransformer = (partTag: Prisma.Part_TagGetPayload<null>): PartTag => {
  return {
    partTagId: partTag.partTagId,
    name: partTag.name,
    colorHexCode: partTag.colorHexCode
  };
};
