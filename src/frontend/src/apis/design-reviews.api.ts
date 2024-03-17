import axios from 'axios';
import { DesignReview } from 'shared';
import { apiUrls } from '../utils/urls';
import { CreateDesignReviewsPayload } from '../hooks/design-reviews.hooks';

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
    transformResponse: (data) => JSON.parse(data)
  });
};
