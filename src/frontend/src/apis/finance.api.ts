/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import {
  reimbursementRequestTransformer,
  reimbursementTransformer
} from './transformers/reimbursement-requests.transformer';

/**
 * Upload a picture of a receipt
 *
 * @param payload Payload containing the image data
 */
export const uploadSingleReceipt = (formData: FormData, id: string) => {
  return axios.post(apiUrls.financeUploadReceipt(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/**
 * Gets a single reimbursement request with the given id
 *
 * @param id The id of the reimbursement request to get
 * @returns The requested reimbursement request
 */
export const getSingleReimbursementRequest = (id: string) => {
  return axios.get(apiUrls.financeReimbursementRequestById(id));
};

/**
 * Get the reimbursement requests for the current user
 */
export const getCurrentUserReimbursementRequests = () => {
  return axios.get(apiUrls.financeGetUserReimbursementRequest(), {
    transformResponse: (data) => JSON.parse(data).map(reimbursementRequestTransformer)
  });
};

/**
 * Gets all the reimbursement requests
 */
export const getAllReimbursementRequests = () => {
  return axios.get(apiUrls.financeEndpoints(), {
    transformResponse: (data) => JSON.parse(data).map(reimbursementRequestTransformer)
  });
};

/**
 * Gets all the reimbursements for a user
 */
export const getCurrentUserReimbursements = () => {
  return axios.get(apiUrls.financeGetUserReimbursements(), {
    transformResponse: (data) => JSON.parse(data).map(reimbursementTransformer)
  });
};

/**
 * Gets all reimbursements
 */
export const getAllReimbursements = () => {
  return axios.get(apiUrls.financeGetAllReimbursements(), {
    transformResponse: (data) => JSON.parse(data).map(reimbursementTransformer)
  });
};
