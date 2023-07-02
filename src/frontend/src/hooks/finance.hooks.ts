/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation, useQuery } from 'react-query';
import { getSingleReimbursementRequest, uploadSingleReceipt } from '../apis/finance.api';
import { ReimbursementRequest } from 'shared';

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
