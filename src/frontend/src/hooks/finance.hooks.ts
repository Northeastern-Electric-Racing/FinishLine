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
  getSingleReimbursementRequest,
  editReimbursementRequest
} from '../apis/finance.api';
import {
  ClubAccount,
  ExpenseType,
  ReimbursementProductCreateArgs,
  ReimbursementReceiptCreateArgs,
  ReimbursementRequest,
  Vendor
} from 'shared';
import { downloadImage } from '../utils/reimbursement-request.utils';

export interface ReimbursementRequestCreateArgs {
  vendorId: string;
  account: ClubAccount;
  dateOfExpense: Date;
  expenseTypeId: string;
  reimbursementProducts: ReimbursementProductCreateArgs[];
  totalCost: number;
}

export interface ReimbursementRequestEditArgs extends ReimbursementRequestCreateArgs {
  receiptPictures: ReimbursementReceiptCreateArgs[];
}

/**
 * Custom React Hook to upload a new picture.
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

/**
 * Uploads many receipts to a given reimbursement request
 *
 * @returns The created receipt information
 */
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

/**
 * Custom react hook to create a reimbursement request
 *
 * @returns the created reimbursement request
 */
export const useCreateReimbursementRequest = () => {
  return useMutation<ReimbursementRequest, Error, ReimbursementRequestCreateArgs>(
    ['finance', 'create'],
    async (formData: ReimbursementRequestCreateArgs) => {
      const { data } = await createReimbursementRequest(formData);
      return data;
    }
  );
};

/**
 * Custom React Hook to edit a reimbursement request.
 *
 * @param reimbursementRequestId The id of the reimbursement request being edited
 * @returns the edited reimbursement request
 */
export const useEditReimbursementRequest = (reimbursementRequestId: string) => {
  return useMutation<ReimbursementRequest, Error, ReimbursementRequestEditArgs>(
    ['finance', 'edit'],
    async (formData: ReimbursementRequestEditArgs) => {
      const { data } = await editReimbursementRequest(reimbursementRequestId, formData);
      return data;
    }
  );
};

/**
 * Custom react hook to get all expense types
 *
 * @returns all the expense types
 */
export const useGetAllExpenseTypes = () => {
  return useQuery<ExpenseType[], Error>(['finance', 'expense-types'], async () => {
    const { data } = await getAllExpenseTypes();
    return data;
  });
};

/**
 * Custom react hook to get all the vendors
 *
 * @returns all the vendors
 */
export const useGetAllVendors = () => {
  return useQuery<Vendor[], Error>(['finance', 'vendors'], async () => {
    const { data } = await getAllVendors();
    return data;
  });
};

/**
 * Custom react hook to get a single reimbursement request
 *
 * @param id id of the reimbursement request to get
 * @returns the reimbursement request
 */
export const useSingleReimbursementRequest = (id: string) => {
  return useQuery<ReimbursementRequest, Error>(['reimbursement-requests', id], async () => {
    const { data } = await getSingleReimbursementRequest(id);
    return data;
  });
};

export const useDownloadImages = (fileIds: string[]) => {
  return useQuery<File[], Error>(['reimbursement-requests', 'download-images', fileIds], async () => {
    const promises = fileIds.map((fileId) => downloadImage(fileId));
    const files = await Promise.all(promises);
    return files;
  });
};
