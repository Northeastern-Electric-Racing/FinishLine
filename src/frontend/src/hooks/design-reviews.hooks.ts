/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DesignReview, TeamType, WbsNumber } from 'shared';
import { createDesignReviews, getAllDesignReviews, getAllTeamTypes } from '../apis/design-reviews.api';

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

/**
 * Custom react hook to get all team types
 *
 * @returns all the team types
 */
export const useAllTeamTypes = () => {
  return useQuery<TeamType[], Error>(['teamTypes'], async () => {
    const { data } = await getAllTeamTypes();
    return data;
  });
};
