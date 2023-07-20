/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { CreateReimbursementRequestPayload } from '../hooks/finance.hooks';
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
export const uploadSingleReceipt = (file: File, id: string) => {
  const formData = new FormData();
  formData.append('image', file);
  return axios.post(apiUrls.financeUploadRceipt(id), formData);
};

/**
 * Creates a new reimbursement request
 *
 * @param formData the data to create a new reimbursement request
 * @returns the created reimbursement request
 */
export const createReimbursementRequest = (formData: CreateReimbursementRequestPayload) => {
  return axios.post(apiUrls.financeCreateReimbursementRequest(), formData);
};

/**
 * Gets all the expense types
 *
 * @returns all the expense types
 */
export const getAllExpenseTypes = () => {
  return axios.get(apiUrls.getAllExpenseTypes());
};

/**
 * Gets all the vendors
 *
 * @returns all the vendors
 */
export const getAllVendors = () => {
  return axios.get(apiUrls.getAllVendors());
};

/**
 * Gets a single reimbursement request
 *
 * @param id the id of the reimbursement request to get
 * @returns the reimbursement request with the given id
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
