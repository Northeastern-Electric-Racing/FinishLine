/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { editDesignReview, getAllDesignReviews } from '../apis/design-reviews.api';
import { DesignReview, DesignReviewStatus } from 'shared';

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

export interface EditDesignReviewPayload {
  dateScheduled: Date;
  teamTypeId: string;
  requiredMembersIds: number[];
  optionalMembersIds: number[];
  isOnline: boolean;
  isInPerson: boolean;
  zoomLink: string | null;
  location: string | null;
  docTemplateLink: string | null;
  status: DesignReviewStatus;
  attendees: number[];
  meetingTimes: number[];
}

export const useEditDesignReview = (designReviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, EditDesignReviewPayload>(
    ['design-reviews', 'edit'],
    async (designReviewPayload: EditDesignReviewPayload) => {
      const { data } = await editDesignReview(designReviewId, designReviewPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['design-reviews', designReviewId]);
      }
    }
  );
};
