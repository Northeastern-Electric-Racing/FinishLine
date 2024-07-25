/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DesignReview, WbsNumber, DesignReviewStatus } from 'shared';
import {
  deleteDesignReview,
  editDesignReview,
  createDesignReviews,
  getAllDesignReviews,
  getSingleDesignReview,
  markUserConfirmed
} from '../apis/design-reviews.api';
import { useCurrentUser } from './users.hooks';

export interface CreateDesignReviewsPayload {
  dateScheduled: Date;
  teamTypeId: string;
  requiredMemberIds: string[];
  optionalMemberIds: string[];
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
  requiredMembersIds: string[];
  optionalMembersIds: string[];
  isOnline: boolean;
  isInPerson: boolean;
  zoomLink?: string;
  location?: string;
  docTemplateLink?: string;
  status: DesignReviewStatus;
  attendees: string[];
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
 * Custom react hook to delete a design review
 */

export const useDeleteDesignReview = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<DesignReview, Error>(
    ['design-reviews', 'delete'],
    async () => {
      const { data } = await deleteDesignReview(id);
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
 * Custom react hook to get a single design review
 *
 * @returns a single design review
 */
export const useSingleDesignReview = (id?: string) => {
  return useQuery<DesignReview, Error>(
    ['design-reviews', id],
    async () => {
      const { data } = await getSingleDesignReview(id!);
      return data;
    },
    { enabled: !!id }
  );
};

export const useMarkUserConfirmed = (id: string) => {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation<DesignReview, Error, { availability: number[] }>(
    ['design-reviews', 'mark-confirmed'],
    async (designReviewPayload: { availability: number[] }) => {
      const { data } = await markUserConfirmed(id, designReviewPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['design-reviews']);
        queryClient.invalidateQueries(['users', user.userId, 'schedule-settings']);
      }
    }
  );
};
