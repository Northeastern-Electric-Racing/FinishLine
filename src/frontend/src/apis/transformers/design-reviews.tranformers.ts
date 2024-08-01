import { DesignReview } from 'shared';

export const designReviewTransformer = (designReview: DesignReview): DesignReview => {
  return {
    ...designReview,
    dateCreated: new Date(designReview.dateCreated),
    dateDeleted: designReview.dateDeleted ? new Date(designReview.dateDeleted) : undefined,
    dateScheduled: new Date(designReview.dateScheduled),
    initialDate: new Date(designReview.initialDate)
  };
};
