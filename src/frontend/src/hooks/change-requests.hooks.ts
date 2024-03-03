/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ChangeRequest, ChangeRequestReason, ChangeRequestType, ProposedSolutionCreateArgs, WbsNumber } from 'shared';
import {
  createActivationChangeRequest,
  createStandardChangeRequest,
  createStageGateChangeRequest,
  getAllChangeRequests,
  getSingleChangeRequest,
  reviewChangeRequest,
  addProposedSolution,
  deleteChangeRequest,
  requestCRReview
} from '../apis/change-requests.api';

/**
 * Custom React Hook to supply all change requests.
 */
export const useAllChangeRequests = () => {
  return useQuery<ChangeRequest[], Error>(['change requests'], async () => {
    const { data } = await getAllChangeRequests();
    return data;
  });
};

/**
 * Custom React Hook to supply a single change request.
 *
 * @param id Change request ID of the requested change request.
 */
export const useSingleChangeRequest = (id: number) => {
  return useQuery<ChangeRequest, Error>(['change requests', id], async () => {
    const { data } = await getSingleChangeRequest(id);
    return data;
  });
};

export interface ReviewPayload {
  reviewerId: number;
  crId: number;
  accepted: boolean;
  reviewNotes: string;
  psId: string;
}

/**
 * Custom React Hook to review a change request.
 */
export const useReviewChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, ReviewPayload>(
    ['change requests', 'review'],
    async (reviewPayload: ReviewPayload) => {
      const { data } = await reviewChangeRequest(
        reviewPayload.reviewerId,
        reviewPayload.crId,
        reviewPayload.accepted,
        reviewPayload.reviewNotes,
        reviewPayload.psId
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['change requests']);
      }
    }
  );
};

/**
 * Custom React Hook to delete a change request.
 */
export const useDeleteChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>(
    ['change requests', 'delete'],
    async (id: number) => {
      const { data } = await deleteChangeRequest(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['change requests']);
      }
    }
  );
};

export type CreateStandardChangeRequestPayload = {
  wbsNum: WbsNumber;
  type: Exclude<ChangeRequestType, 'STAGE_GATE' | 'ACTIVATION'>;
  why: { explain: string; type: ChangeRequestReason }[];
  proposedSolutions: ProposedSolutionCreateArgs[];
};

/**
 * Custom React Hook to create a standard change request.
 */
export const useCreateStandardChangeRequest = () => {
  return useMutation<{ message: string }, Error, CreateStandardChangeRequestPayload>(
    ['change requests', 'create', 'standard'],
    async (payload: CreateStandardChangeRequestPayload) => {
      const { data } = await createStandardChangeRequest(payload);
      return data;
    }
  );
};

export interface Payload {
  submitterId: number;
  wbsNum: WbsNumber;
  projectLeadId: number;
  projectManagerId: number;
  startDate: string;
  confirmDetails: boolean;
  confirmDone: boolean;
  crId: number;
  description: string;
  scopeImpact: string;
  timelineImpact: number;
  budgetImpact: number;
}

/**
 * Custom React Hook to create an activation change request.
 */
export const useCreateActivationChangeRequest = () => {
  return useMutation<{ message: string }, Error, Payload>(
    ['change requests', 'create', 'activation'],
    async (payload: Payload) => {
      const { data } = await createActivationChangeRequest(
        payload.submitterId,
        payload.wbsNum,
        payload.projectLeadId,
        payload.projectManagerId,
        payload.startDate,
        payload.confirmDetails
      );
      return data;
    }
  );
};

/**
 * Custom React Hook to create a stage gate change request.
 */
export const useCreateStageGateChangeRequest = () => {
  return useMutation<{ message: string }, Error, Payload>(
    ['change requests', 'create', 'stage gate'],
    async (payload: Payload) => {
      const { data } = await createStageGateChangeRequest(payload.submitterId, payload.wbsNum, payload.confirmDone);
      return data;
    }
  );
};

/**
 * Custom React Hook to create a proposed solution
 */
export const useCreateProposeSolution = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, Payload>(
    ['change requests', 'create', 'propose solution'],
    async (payload: Payload) => {
      const { data } = await addProposedSolution(
        payload.submitterId,
        payload.crId,
        payload.description,
        payload.scopeImpact,
        payload.timelineImpact,
        payload.budgetImpact
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['change requests']);
      }
    }
  );
};

export interface CRReviewPayload {
  userIds: number[];
}

/**
 * Custom React hook to request cr reviewers
 */
export const useRequestCRReview = (crId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, CRReviewPayload>(
    ['change requests', 'review'],
    async (crReviewPayload) => {
      const { data } = await requestCRReview(crId, crReviewPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['change requests']);
      }
    }
  );
};
