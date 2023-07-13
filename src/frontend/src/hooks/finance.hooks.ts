/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMutation } from 'react-query';
import { uploadSingleReceipt } from '../apis/finance.api';

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
