/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery } from 'react-query';
import {
  createReimbursementRequest,
  getAllExpenseTypes,
  getAllVendors,
  uploadSingleReceipt,
  getSingleReimbursementRequest
} from '../apis/finance.api';
import { ExpenseType, ReimbursementRequest, Vendor } from 'shared';
import { CreateReimbursementRequestFormInput } from '../pages/FinancePage/CreateReimbursementRequestForm/CreateReimbursementRequestForm';

/**
 * Custom React Hook to upload a new picture.
 *
 */
export const useUploadSingleReceipt = () => {
  return useMutation<{ googleFileId: string; name: string }, Error, { file: File; id: string }>(
    ['finance', 'image'],
    async (formData: { file: File; id: string }) => {
      const { data } = await uploadSingleReceipt(formData.file, formData.id);
      return data;
    }
  );
};

export const useUploadManyReceipts = () => {
  return useMutation<{ googleFileId: string; name: string }[], Error, { files: File[]; id: string }>(
    ['finance', 'image'],
    async (formData: { files: File[]; id: string }) => {
      const promises = formData.files.map((file) => uploadSingleReceipt(file, formData.id));
      const results = await Promise.all(promises);
      return results.map((result) => result.data);
    }
  );
};

export const useCreateReimbursementRequest = () => {
  return useMutation<ReimbursementRequest, Error, any>(
    ['finance', 'create'],
    async (formData: CreateReimbursementRequestFormInput) => {
      const { data } = await createReimbursementRequest(formData);
      return data;
    }
  );
};

export const useGetAllExpenseTypes = () => {
  return useQuery<ExpenseType[], Error>(['finance', 'expense-types'], async () => {
    const { data } = await getAllExpenseTypes();
    return data;
  });
};

export const useGetAllVendors = () => {
  return useQuery<Vendor[], Error>(['finance', 'vendors'], async () => {
    const { data } = await getAllVendors();
    return data;
  });
};

/**
 * custom react hook to get a single reimbursement request
 * @param id Id of the reimbursement request to get
 * @returns the reimbursement request
 */
export const useSingleReimbursementRequest = (id: string) => {
  return useQuery<ReimbursementRequest, Error>(['reimbursement-requests', id], async () => {
    const { data } = await getSingleReimbursementRequest(id);
    return data;
  });
};
