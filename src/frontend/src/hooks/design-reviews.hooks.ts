/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useQuery } from 'react-query';
import { getAllDesignReviews, getSingleDesignReview } from '../apis/design-reviews.api';
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

export const useSingleDesignReview = (id: string) => {
  return useQuery<DesignReview, Error>(['design-reviews'], async () => {
    const { data } = await getSingleDesignReview(id);
    return data;
  });
};
