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
  editReimbursementRequest,
  getAllReimbursements,
  getCurrentUserReimbursements,
  getAllReimbursementRequests,
  getCurrentUserReimbursementRequests,
  downloadImage,
  downloadGoogleImage,
  blobsToPdf
} from '../apis/finance.api';
import {
  ClubAccount,
  ExpenseType,
  ReimbursementProductCreateArgs,
  ReimbursementRequest,
  Vendor,
  Reimbursement,
  ReimbursementReceiptCreateArgs
} from 'shared';

export interface CreateReimbursementRequestPayload {
  vendorId: string;
  account: ClubAccount;
  dateOfExpense: Date;
  expenseTypeId: string;
  reimbursementProducts: ReimbursementProductCreateArgs[];
  totalCost: number;
}

export interface EditReimbursementRequestPayload extends CreateReimbursementRequestPayload {
  receiptPictures: ReimbursementReceiptCreateArgs[];
}

/**
 * Custom React Hook to upload a new picture.
 */
export const useUploadSingleReceipt = () => {
  return useMutation<{ googleFileId: string; name: string }, Error, { file: File; id: string }>(
    ['reimbursement-requsts', 'edit'],
    async (formData: { file: File; id: string }) => {
      const { data } = await uploadSingleReceipt(formData.file, formData.id);
      return data;
    }
  );
};

/**
 * Custom hook that uploads many receipts to a given reimbursement request
 *
 * @returns The created receipt information
 */
export const useUploadManyReceipts = () => {
  return useMutation<{ googleFileId: string; name: string }[], Error, { files: File[]; id: string }>(
    ['reimbursement-requests', 'edit'],
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
  return useMutation<ReimbursementRequest, Error, CreateReimbursementRequestPayload>(
    ['reimbursement-requests', 'create'],
    async (formData: CreateReimbursementRequestPayload) => {
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
  return useMutation<ReimbursementRequest, Error, EditReimbursementRequestPayload>(
    ['reimbursement-requests', 'edit'],
    async (formData: EditReimbursementRequestPayload) => {
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
  return useQuery<ExpenseType[], Error>(['expense-types'], async () => {
    const { data } = await getAllExpenseTypes();
    return data;
  });
};

/**
 * Custom React Hook to get the reimbursement requests for the current user
 */
export const useCurrentUserReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement-requests', 'user'], async () => {
    const { data } = await getCurrentUserReimbursementRequests();
    return data;
  });
};

/**
 * Custom react hook to get all the vendors
 *
 * @returns all the vendors
 */
export const useGetAllVendors = () => {
  return useQuery<Vendor[], Error>(['vendors'], async () => {
    const { data } = await getAllVendors();
    return data;
  });
};
/**
 * Custom React Hook to get all the reimbursement requests
 */
export const useAllReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement-requests'], async () => {
    const { data } = await getAllReimbursementRequests();
    return data;
  });
};

/**
 * Custom React Hook to get the reimbursements for the current user
 */
export const useCurrentUserReimbursements = () => {
  return useQuery<Reimbursement[], Error>(['reimbursement', 'user'], async () => {
    const { data } = await getCurrentUserReimbursements();
    return data;
  });
};

/**
 * Custom React Hook to get all the reimbursements
 */
export const useAllReimbursements = () => {
  return useQuery<Reimbursement[], Error>(['reimbursement'], async () => {
    const { data } = await getAllReimbursements();
    return data;
  });
};

/**
 * Custom react hook to get a single reimbursement request
 *
 * @param id Id of the reimbursement request to get
 * @returns the reimbursement request
 */
export const useSingleReimbursementRequest = (id: string) => {
  return useQuery<ReimbursementRequest, Error>(['reimbursement-requests', id], async () => {
    const { data } = await getSingleReimbursementRequest(id);
    return data;
  });
};

/**
 * Custom react hook to download images from google drive
 *
 * @param fileIds The google file ids to fetch the images for
 * @returns the downloaded images
 */
export const useDownloadImages = (fileIds: string[]) => {
  return useQuery<File[], Error>(['reimbursement-requests', 'edit', fileIds], async () => {
    const promises = fileIds.map((fileId) => downloadImage(fileId));
    const files = await Promise.all(promises);
    return files;
  });
};

export const useDownloadPDFOfImages = () => {
  return useMutation(['reimbursement-requests'], async (formData: { fileIds: string[] }) => {
    const promises = formData.fileIds.map((fileId) => {
      return downloadGoogleImage(fileId);
    });
    const blobs = await Promise.all(promises);
    await blobsToPdf(blobs, `receipts-${new Date().toLocaleDateString()}.pdf`);
  });
};
