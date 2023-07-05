/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { CreateReimbursementRequestFormInput } from '../pages/FinancePage/CreateReimbursementRequestForm/CreateReimbursementRequestForm';
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

export const createReimbursementRequest = (formData: CreateReimbursementRequestFormInput) => {
  return axios.post(apiUrls.financeCreateReimbursementRequest(), formData);
};

export const getAllExpenseTypes = () => {
  return axios.get(apiUrls.getAllExpenseTypes());
};

export const getAllVendors = () => {
  return axios.get(apiUrls.getAllVendors());
};

export const getSingleReimbursementRequest = (id: string) => {
  return axios.get(apiUrls.financeReimbursementRequestById(id));
};
