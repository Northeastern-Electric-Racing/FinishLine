/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { ReimbursementRequestContentArgs } from '../hooks/finance.hooks';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

/**
 * Upload a picture of a receipt
 *
 * @param payload Payload containing the image data
 */
export const uploadSingleReceipt = (file: File, id: string) => {
  const formData = new FormData();
  formData.append('image', file);
  console.log(formData);
  return axios.post(apiUrls.financeUploadRceipt(id), formData);
};

/**
 * Creates a new reimbursement request
 *
 * @param formData the data to create a new reimbursement request
 * @returns the created reimbursement request
 */
export const createReimbursementRequest = (formData: ReimbursementRequestContentArgs) => {
  return axios.post(apiUrls.financeCreateReimbursementRequest(), formData);
};

/**
 * Edits a reimbursment request
 *
 * @param id the id of the reimbursement request to edit
 * @param formData the data to edit the reimbursement request with
 * @returns the edited reimbursement request
 */
export const editReimbursementRequest = (id: string, formData: ReimbursementRequestContentArgs) => {
  return axios.post(apiUrls.financeEditReimbursementRequest(id), formData);
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
