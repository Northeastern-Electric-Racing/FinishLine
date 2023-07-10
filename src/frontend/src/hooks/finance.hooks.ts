/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery } from 'react-query';
import {
  getAllReimbursementRequests,
  getAllReimbursements,
  getCurrentUserReimbursementRequests,
  getCurrentUserReimbursements,
  uploadSingleReceipt
} from '../apis/finance.api';
import { Reimbursement, ReimbursementRequest } from 'shared';

/**
 * Custom React Hook to upload a new picture.
 *
 */
export const useUploadSingleReceipt = (id: string) => {
  return useMutation<any, Error, any>(['finance', 'image'], async (formData: FormData) => {
    const { data } = await uploadSingleReceipt(formData, id);
    return data;
  });
};

/**
 * Custom React Hook to get the reimbursement requests for the current user
 *
 */
export const useCurrentUserReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement request', 'user'], async () => {
    const { data } = await getCurrentUserReimbursementRequests();
    return data;
  });
};

/**
 * Custom React Hook to get the reimbursement requests for the current user
 *
 */
export const useAllReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement request'], async () => {
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

export const useAllReimbursements = () => {
  return useQuery<Reimbursement[], Error>(['reimbursement'], async () => {
    const { data } = await getAllReimbursements();
    return data;
  });
};
