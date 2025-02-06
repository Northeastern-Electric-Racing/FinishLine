import { DesignReview } from 'shared';

export const designReviewTransformer = (designReview: DesignReview): DesignReview => {
  const anyDesignReview = designReview as any;
  return {
    ...designReview,
    dateCreated: new Date(anyDesignReview.dateCreated.split('T')[0] + 'T04:00:00.000Z'), // Adjust to EST since UTC is 4 hours ahead
    dateDeleted: designReview.dateDeleted
      ? new Date(anyDesignReview.dateDeleted.split('T')[0] + 'T04:00:00.000Z')
      : undefined,
    dateScheduled: new Date(anyDesignReview.dateScheduled.split('T')[0] + 'T04:00:00.000Z'),
    initialDate: new Date(anyDesignReview.initialDate.split('T')[0] + 'T04:00:00.000Z')
  };
};
