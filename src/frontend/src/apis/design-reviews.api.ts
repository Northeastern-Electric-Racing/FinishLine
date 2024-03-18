/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { designReviewTransformer } from './transformers/design-reviews.tranformers';

/**
 * Gets all the design reviews
 */
export const getAllDesignReviews = () => {
  return axios.get(apiUrls.designReviews(), {
    transformResponse: (data) => JSON.parse(data).map(designReviewTransformer)
  });
};

/**
 * Gets a single design review
 * @param id the ID of the design review to return
 * @returns the request design review
 */
export const getSingleDesignReview = async (id: string) => {
  console.log(id);
  return axios.get(apiUrls.designReviewById(id), {
    transformResponse: (data) => designReviewTransformer(JSON.parse(data))
  });
};
