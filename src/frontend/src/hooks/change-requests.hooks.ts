/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';
import {
  ChangeRequest,
  ProjectProposedChangesCreateArgs,
  WbsNumber,
  WorkPackageProposedChangesCreateArgs,
  LeadershipChangeCreateArgs,
  GuestChangeRequest
} from 'shared';
import {
  createActivationChangeRequest,
  createStandardChangeRequest,
  createStageGateChangeRequest,
  getAllChangeRequests,
  getSingleChangeRequest,
  reviewChangeRequest,
  deleteChangeRequest,
  requestCRReview,
  getToReviewChangeRequests,
  getUnreviewedChangeRequests,
  getApprovedChangeRequests,
  createBudgetChangeRequest,
  createLeadershipChangeRequest,
  getAllGuestChangeRequests
} from '../apis/change-requests.api';

/**
 * Custom React Hook to supply all change requests.
 */
export const useAllChangeRequests = () => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<ChangeRequest[], Error>(
    ['change requests', selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id],
    async () => {
      const { data } = await getAllChangeRequests();
      return data;
    }
  );
};

export const useAllGuestChangeRequests = () => {
  return useQuery<GuestChangeRequest[], Error>(['guest change requests'], async () => {
    const { data } = await getAllGuestChangeRequests();
    return data;
  });
};

export const useGetToReviewChangeRequests = () => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<ChangeRequest[], Error>(
    ['change requests', 'to-review', selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id],
    async () => {
      const { data } = await getToReviewChangeRequests();
      return data;
    }
  );
};

export const useGetUnreviewedChangeRequests = (wbsNum?: WbsNumber) => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<ChangeRequest[], Error>(
    ['change requests', 'unreviewed', selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id, wbsNum],
    async () => {
      const { data } = await getUnreviewedChangeRequests(wbsNum);
      return data;
    }
  );
};

export const useGetApprovedChangeRequests = (wbsNum?: WbsNumber) => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<ChangeRequest[], Error>(
    ['change requests', 'approved', selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id, wbsNum],
    async () => {
      const { data } = await getApprovedChangeRequests(wbsNum);
      return data;
    }
  );
};

/**
 * Custom React Hook to supply a single change request.
 *
 * @param id Change request ID of the requested change request.
 */
export const useSingleChangeRequest = (id: string) => {
  return useQuery<ChangeRequest, Error>(['change requests', id], async () => {
    const { data } = await getSingleChangeRequest(id);
    return data;
  });
};

export interface ReviewPayload {
  reviewerId: string;
  crId: string;
  accepted: boolean;
  reviewNotes?: string;
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
        reviewPayload.reviewNotes
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
  return useMutation<{ message: string }, Error, string>(
    ['change requests', 'delete'],
    async (id: string) => {
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
  why: string;
  projectProposedChanges?: ProjectProposedChangesCreateArgs;
  workPackageProposedChanges?: WorkPackageProposedChangesCreateArgs;
};

/**
 * Custom React Hook to create a standard change request.
 */
export const useCreateStandardChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, CreateStandardChangeRequestPayload>(
    ['change requests', 'create', 'standard'],
    async (payload: CreateStandardChangeRequestPayload) => {
      const { data } = await createStandardChangeRequest(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['change requests']);
      }
    }
  );
};

export interface CreateActivationChangeRequestPayload {
  submitterId: string;
  wbsNum: WbsNumber;
  leadId: string;
  managerId: string;
  startDate: string;
  confirmDetails: boolean;
  type: string;
}

export interface CreateStageGateChangeRequestPayload {
  submitterId: string;
  wbsNum: WbsNumber;
  confirmDone: boolean;
  type: string;
}

export interface CreateBudgetChangeRequestPayload {
  submitterId: string;
  otherReasonId?: string;
  accountCodeId?: string;
  proposedBudget: number;
  type: string;
}

/**
 * Custom React Hook to create an activation change request.
 */
export const useCreateActivationChangeRequest = () => {
  return useMutation<{ message: string }, Error, CreateActivationChangeRequestPayload>(
    ['change requests', 'create', 'activation'],
    async (payload: CreateActivationChangeRequestPayload) => {
      const { data } = await createActivationChangeRequest(
        payload.submitterId,
        payload.wbsNum,
        payload.leadId,
        payload.managerId,
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
  return useMutation<{ message: string }, Error, CreateStageGateChangeRequestPayload>(
    ['change requests', 'create', 'stage gate'],
    async (payload: CreateStageGateChangeRequestPayload) => {
      const { data } = await createStageGateChangeRequest(payload.submitterId, payload.wbsNum, payload.confirmDone);
      return data;
    }
  );
};

/**
 * Custom React Hook to create a budget change request.
 */
export const useCreateBudgetChangeRequest = () => {
  return useMutation<{ message: string }, Error, CreateBudgetChangeRequestPayload>(
    ['change requests', 'create', 'budget'],
    async (payload: CreateBudgetChangeRequestPayload) => {
      const { data } = await createBudgetChangeRequest(
        payload.submitterId,
        payload.proposedBudget,
        payload.otherReasonId,
        payload.accountCodeId
      );
      return data;
    }
  );
};

/**
 * Custome React hook to create a leadership change request
 * to change lead and/or manager of a project or work package
 */
export const useCreateLeadershipChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, LeadershipChangeCreateArgs>(
    ['change requests', 'create', 'leadership'],
    async (payload: LeadershipChangeCreateArgs) => {
      const { data } = await createLeadershipChangeRequest(
        payload.submitterId,
        payload.wbsNum,
        payload.leadId,
        payload.managerId
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['change requests']);
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['work packages']);
      }
    }
  );
};

export interface CRReviewPayload {
  userIds: string[];
}

/**
 * Custom React hook to request cr reviewers
 */
export const useRequestCRReview = (crId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, CRReviewPayload>(
    ['change requests', 'review'],
    async (crReviewPayload: CRReviewPayload) => {
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
