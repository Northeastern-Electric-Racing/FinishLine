/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DesignReview, TeamType, WbsNumber, DesignReviewStatus } from 'shared';
import {
  editDesignReview,
  createDesignReviews,
  getAllDesignReviews,
  getAllTeamTypes,
  getSingleDesignReview
} from '../apis/design-reviews.api';

export interface CreateDesignReviewsPayload {
  dateScheduled: Date;
  teamTypeId: string;
  requiredMemberIds: number[];
  optionalMemberIds: number[];
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
        queryClient.invalidateQueries(['design-reviews']);
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

/**
 * Custom React Hook to edit a Design Review
 * @param designReviewId the design review being edited
 */
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
        queryClient.invalidateQueries(['design-reviews']);
      }
    }
  );
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

/**
 * Custom react hook to get a single design review
 *
 * @returns a single design review
 */
export const useSingleDesignReview = (id: string) => {
  return useQuery<DesignReview, Error>(['design-reviews', id], async () => {
    const { data } = await getSingleDesignReview(id);
    return data;
  });
};
