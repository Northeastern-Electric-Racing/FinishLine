/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { deleteDesignReview, getAllDesignReviews, getSingleDesignReview } from '../apis/design-reviews.api';
import { DesignReview } from 'shared';

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
