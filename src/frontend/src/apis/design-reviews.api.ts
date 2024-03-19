/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import axios from '../utils/axios';
import { DesignReview } from 'shared';
import { apiUrls } from '../utils/urls';
import { CreateDesignReviewsPayload } from '../hooks/design-reviews.hooks';
import { designReviewTransformer } from './transformers/design-reviews.tranformers';

/**
 * Create a design review
 * @param payload all info needed to create a design review
 */
export const createDesignReviews = async (payload: CreateDesignReviewsPayload) => {
  return axios.post<DesignReview>(apiUrls.designReviewsCreate(), payload);
};

/**
 * Gets all the design reviews
 */
export const getAllDesignReviews = () => {
  return axios.get(apiUrls.designReviews(), {
    transformResponse: (data) => JSON.parse(data).map(designReviewTransformer)
  });
};

/**
 * Gets all the team types
 */
export const getAllTeamTypes = () => {
  return axios.get(apiUrls.teamTypes(), {
    transformResponse: (data) => JSON.parse(data)
  });
};
