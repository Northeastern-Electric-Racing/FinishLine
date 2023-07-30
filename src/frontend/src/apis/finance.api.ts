/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { CreateReimbursementRequestPayload, EditReimbursementRequestPayload } from '../hooks/finance.hooks';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import {
  reimbursementRequestTransformer,
  reimbursementTransformer,
  vendorTransformer
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
 * Edits a reimbursment request
 *
 * @param id the id of the reimbursement request to edit
 * @param formData the data to edit the reimbursement request with
 * @returns the edited reimbursement request
 */
export const editReimbursementRequest = (id: string, formData: EditReimbursementRequestPayload) => {
  return axios.post(apiUrls.financeEditReimbursementRequest(id), formData);
};

/**
 * Gets all the expense types
 *
 * @returns all the expense types
 */
export const getAllExpenseTypes = () => {
  return axios.get(apiUrls.getAllExpenseTypes(), {
    transformResponse: (data) =>
      JSON.parse(data).map((expenseType: any) => ({ ...expenseType, id: expenseType.expenseTypeId }))
  });
};

/**
 * Gets all the vendors
 *
 * @returns all the vendors
 */
export const getAllVendors = () => {
  return axios.get(apiUrls.getAllVendors(), {
    transformResponse: (data) => JSON.parse(data).map(vendorTransformer)
  });
};

/**
 * Gets a single reimbursement request
 *
 * @param id the id of the reimbursement request to get
 * @returns the reimbursement request with the given id
 */
export const getSingleReimbursementRequest = (id: string) => {
  return axios.get(apiUrls.financeReimbursementRequestById(id), {
    transformResponse: (data) => reimbursementRequestTransformer(JSON.parse(data))
  });
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

/**
 * Downloads a given fileId from google drive
 *
 * @param fileId the id of the file to download
 * @returns the downloaded file
 */
export const downloadImage = async (fileId: string): Promise<File> => {
  const url = `https://drive.google.com/file/d/${fileId}/?alt=media`;
  const response = await fetch(url, { mode: 'no-cors' });
  const blob = await response.blob();

  const fileName = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '');

  const mimeType = blob.type;
  const file = new File([blob], fileName!, { type: mimeType });
  return file;
};

/**
 * Reports a given dollar amount representing a new account credit
 *
 * @param id the id of the user who is being reimbursed
 * @param formData the dollar amount being reimbursed
 * @returns a reimbursement with the given user and dollar amount
 */
export const reportRefund = (id: string, refundAmount: number) => {
  return axios.post(apiUrls.financeReportRefund(id), refundAmount);
};
