/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { EditDesignReviewPayload } from '../hooks/design-reviews.hooks';
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

/**
 * Edit a design review
 *
 * @param designReviewId The id of the design review being edited
 * @param payload The new information for the design review
 */
export const editDesignReview = (designReviewId: string, payload: EditDesignReviewPayload) => {
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

/**
 * Deletes a design review
 * @param id the ID of the design review to delete
 */
export const deleteDesignReview = async (id: string) => {
  return axios.delete(apiUrls.designReviewDelete(id));
};

export const markUserConfirmed = async (id: string, payload: { availability: number[] }) => {
  return axios.post<DesignReview>(apiUrls.designReviewMarkUserConfirmed(id), payload);
};
