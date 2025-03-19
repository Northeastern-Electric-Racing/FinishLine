import { Part, Part_Review_Popup, PartPreview, PartReview, PartReviewRequest, PartSubmission, PartTag } from 'shared';
import { userTransformer } from './users.transformers';

export const partPreviewTransformer = (partPreview: PartPreview): PartPreview => {
  return {
    ...partPreview,
    tags: partPreview.tags.map(partTagTransformer),
    assignees: partPreview.assignees.map(userTransformer),
    reviewRequests: partPreview.reviewRequests.map(partReviewRequestTransformer),
    userCreated: userTransformer(partPreview.userCreated),
    createdAt: new Date(partPreview.createdAt)
  };
};

export const partTransformer = (part: Part): Part => {
  return {
    ...partPreviewTransformer(part),
    submissions: part.submissions.map(partSubmissionTransformer)
  };
};

export const partSubmissionTransformer = (partSubmission: PartSubmission): PartSubmission => {
  return {
    ...partSubmission,
    userCreated: userTransformer(partSubmission.userCreated),
    reviews: partSubmission.reviews.map(partReviewTransformer),
    createdAt: new Date(partSubmission.createdAt)
  };
};

export const partReviewRequestTransformer = (partReviewRequest: PartReviewRequest): PartReviewRequest => {
  return {
    ...partReviewRequest,
    requester: userTransformer(partReviewRequest.requester),
    reviewerRequested: userTransformer(partReviewRequest.reviewerRequested),
    createdAt: new Date(partReviewRequest.createdAt)
  };
};

export const partReviewTransformer = (partReview: PartReview): PartReview => {
  return {
    ...partReview,
    popUps: partReview.popUps.map(partReviewPopupTransformer),
    createdAt: new Date(partReview.createdAt),
    completedAt: partReview.completedAt ? new Date(partReview.completedAt) : undefined,
    userCreated: userTransformer(partReview.userCreated)
  };
};

export const partReviewPopupTransformer = (partReviewPopup: Part_Review_Popup): Part_Review_Popup => {
  return {
    ...partReviewPopup
  };
};

export const partTagTransformer = (partTag: PartTag): PartTag => {
  return {
    ...partTag
  };
};
