/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { WorkPackage, WbsNumber } from 'shared';
import {
  createSingleWorkPackage,
  deleteWorkPackage,
  editWorkPackage,
  getAllBlockingWorkPackages,
  getAllWorkPackages,
  getSingleWorkPackage,
  slackUpcomingDeadlines,
  getManyWorkPackages
} from '../apis/work-packages.api';

/**
 * Custom React Hook to supply all work packages.
 */
export const useAllWorkPackages = (queryParams?: { [field: string]: string }) => {
  return useQuery<WorkPackage[], Error>(['work packages', queryParams], async () => {
    const { data } = await getAllWorkPackages(queryParams);
    return data;
  });
};

/**
 * Custom React Hook to supply a single work package.
 *
 * @param wbsNum WBS number of the requested work package.
 */
export const useSingleWorkPackage = (wbsNum: WbsNumber) => {
  return useQuery<WorkPackage, Error>(['work packages', wbsNum], async () => {
    const { data } = await getSingleWorkPackage(wbsNum);
    return data;
  });
};

/**
 * Custom React Hook to create a new work package.
 *
 * @param wpPayload Payload containing all information needed to create a work package.
 */
export const useCreateSingleWorkPackage = () => {
  return useMutation<{ message: string }, Error, any>(['work packages', 'create'], async (wpPayload: any) => {
    const { data } = await createSingleWorkPackage(wpPayload);
    return data;
  });
};

/**
 * Custom React Hook to edit a work package.
 *
 * @returns React-query tility functions exposed by the useMutation hook
 */
export const useEditWorkPackage = (wbsNum: WbsNumber) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['work packages', 'edit'],
    async (wpPayload: any) => {
      const { data } = await editWorkPackage(wpPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['work packages', wbsNum]);
      }
    }
  );
};

/**
 * Custom React Hook to delete a work package.
 */
export const useDeleteWorkPackage = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['work packages', 'delete'],
    async (wbsNum: WbsNumber) => {
      const { data } = await deleteWorkPackage(wbsNum);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['work packages']);
      }
    }
  );
};

/**
 * Custom React Hook to get all blocking work packages
 */
export const useGetBlockingWorkPackages = (wbsNum: WbsNumber) => {
  return useQuery<WorkPackage[], Error>(['work packages', 'blocking', wbsNum], async () => {
    const { data } = await getAllBlockingWorkPackages(wbsNum);
    return data;
  });
};

/**
 * Custom React Hook to get many work packages
 */
export const useGetManyWorkPackages = (wbsNums: WbsNumber[]) => {
  return useQuery<WorkPackage[], Error>(['work packages', 'blocking', wbsNums], async () => {
    const { data } = await getManyWorkPackages(wbsNums);
    return data;
  });
};

/**
 * Custom React Hook to slack upcoming deadlines.
 */
export const useSlackUpcomingDeadlines = () => {
  return useMutation<{ message: string }, Error, any>(['slack upcoming deadlines'], async (deadline: Date) => {
    const { data } = await slackUpcomingDeadlines(deadline);
    return data;
  });
};
