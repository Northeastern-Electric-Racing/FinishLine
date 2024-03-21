import { DesignReview } from 'shared';

export const designReviewTransformer = (designReview: DesignReview) => {
  return {
    ...designReview,
    dateCreated: new Date(designReview.dateCreated),
    dateDeleted: designReview.dateDeleted ? new Date(designReview.dateDeleted) : undefined,
    dateScheduled: designReview.dateScheduled ? new Date(designReview.dateScheduled) : undefined
  };
};
