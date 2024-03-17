import axios from 'axios';
import { EditDesignReviewPayload } from '../hooks/design-reviews.hooks';
import { apiUrls } from '../utils/urls';

export const editDesignReview = (designReviewId: string, payload: EditDesignReviewPayload) => {
  return axios.post<{ message: string }>(apiUrls.designReviewsEdit(designReviewId), {
    ...payload
  });
};
