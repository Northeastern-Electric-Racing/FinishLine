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

export const editDesignReview = (designReviewId: string, payload: EditDesignReviewPayload) => {
  console.log('Editing design review' + designReviewId + payload.meetingTimes);
  return axios.post<{ message: string }>(apiUrls.designReviewsEdit(designReviewId), {
    ...payload
  });
};