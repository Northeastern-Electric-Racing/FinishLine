/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useQuery } from 'react-query';
import {
  getAllReimbursementRequests,
  getAllReimbursements,
  getCurrentUserReimbursementRequests,
  getCurrentUserReimbursements,
  getSingleReimbursementRequest
} from '../apis/finance.api';
import { Reimbursement, ReimbursementRequest } from 'shared';

/**
 * Custom React Hook to get the reimbursement requests for the current user
 *
 */
export const useCurrentUserReimbursementRequests = () => {
  return useQuery<ReimbursementRequest[], Error>(['reimbursement-requests', 'user'], async () => {
    const { data } = await getCurrentUserReimbursementRequests();
    return data;
  });
};

/**
 * Custom React Hook to get all the reimbursement requests
 *
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
 * @param id Id of the reimbursement request to get
 * @returns the reimbursement request
 */
export const useSingleReimbursementRequest = (id: string) => {
  return useQuery<ReimbursementRequest, Error>(['reimbursement-requests', id], async () => {
    const { data } = await getSingleReimbursementRequest(id);
    return data;
  });
};
