import { useMutation, useQueryClient } from 'react-query';
import { editDesignReview } from '../apis/design-reviews.api';
import { Design_Review_Status } from '@prisma/client';

export interface EditDesignReviewPayload {
  designReviewId: string;
  dateScheduled: Date;
  teamTypeId: string;
  requiredMembersIds: number[];
  optionalMembersIds: number[];
  isOnline: boolean;
  isInPerson: boolean;
  zoomLink: string | null;
  location: string | null;
  docTemplateLink: string | null;
  status: Design_Review_Status;
  attendees: number[];
  meetingTimes: number[];
}

export const useEditDesignReview = (designReviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, EditDesignReviewPayload>(
    ['design reviews', 'edit'],
    async (designReviewPayload: EditDesignReviewPayload) => {
      const { data } = await editDesignReview(designReviewId, designReviewPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['design reviews', designReviewId]);
      }
    }
  );
};
