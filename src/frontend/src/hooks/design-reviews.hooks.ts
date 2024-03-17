import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DesignReview, WbsNumber } from 'shared';
import { createDesignReviews, getAllDesignReviews } from '../apis/design-reviews.api';

export interface CreateDesignReviewsPayload {
  dateScheduled: Date;
  teamTypeId: string;
  requiredMemberIds: number[];
  optionalMemberIds: number[];
  location?: string;
  isOnline: boolean;
  isInPerson: boolean;
  zoomLink?: string;
  docTemplateLink?: string;
  wbsNum: WbsNumber;
  meetingTimes: number[];
}

export const useCreateDesignReviews = () => {
  const queryClient = useQueryClient();
  return useMutation<DesignReview, Error, CreateDesignReviewsPayload>(
    ['design reviews', 'create'],
    async (formData: CreateDesignReviewsPayload) => {
      const { data } = await createDesignReviews(formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['design reviews']);
      }
    }
  );
};

/**
 * Custom react hook to get all design reviews
 *
 * @returns all the design reviews
 */
export const useAllDesignReviews = () => {
  return useQuery<DesignReview[], Error>(['design-reviews'], async () => {
    const { data } = await getAllDesignReviews();
    return data;
  });
};
