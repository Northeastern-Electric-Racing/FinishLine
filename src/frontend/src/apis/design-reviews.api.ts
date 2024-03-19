/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { EditDesignReviewPayload } from '../hooks/design-reviews.hooks';
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
 * Edit a design review
 *
 * @param designReviewId The id of the design review being edited
 * @param payload The new information for the design review
 */
export const editDesignReview = (designReviewId: string, payload: EditDesignReviewPayload) => {
  console.log(payload);
  return axios.post<{ message: string }>(apiUrls.designReviewsEdit(designReviewId), {
    ...payload
  });
};

/**
 * Gets a single design review
 * @param id the ID of the design review to return
 * @returns the request design review
 */
export const getSingleDesignReview = async (id: string) => {
  return axios.get(apiUrls.designReviewById(id), {
    transformResponse: (data) => designReviewTransformer(JSON.parse(data))
  });
};
