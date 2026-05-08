/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { WorkPackage, WorkPackagePreview, WbsNumber, WorkPackageSelection } from 'shared';
import { wbsPipe } from '../utils/pipes';
import {
  createSingleWorkPackage,
  deleteWorkPackage,
  editWorkPackage,
  getAllBlockingWorkPackages,
  getAllWorkPackages,
  getAllWorkPackagesPreview,
  getManyWorkPackages,
  getSingleWorkPackage,
  getWorkPackagesByProject,
  slackUpcomingDeadlines,
  WorkPackageCreateArgs,
  WorkPackageEditArgs,
  getHomePageWorkPackages
} from '../apis/work-packages.api';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';

/**
 * Custom React Hook to supply all work packages.
 */
export const useAllWorkPackages = (queryParams?: { [field: string]: string }) => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<WorkPackage[], Error>(
    ['work packages', queryParams, selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id],
    async () => {
      const { data } = await getAllWorkPackages(queryParams);
      return data;
    }
  );
};

/**
 * Custom React Hook to supply all work packages in preview format (minimal data).
 */
export const useAllWorkPackagesPreview = (status?: string) => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<WorkPackagePreview[], Error>(
    ['work packages', 'preview', status, selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id],
    async () => {
      const { data } = await getAllWorkPackagesPreview(status);
      return data;
    }
  );
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
 * Custom React Hook to get all work packages for a given project
 * @param projectWbsNum the wbs number of the project
 */
export const useWorkPackagesByProject = (projectWbsNum: WbsNumber) => {
  return useQuery<WorkPackage[], Error>(['work-packages', 'by-project', wbsPipe(projectWbsNum)], async () => {
    const { data } = await getWorkPackagesByProject(projectWbsNum);
    return data;
  });
};

/**
 * Custom React Hook to create a new work package.
 *
 * @param wpPayload Payload containing all information needed to create a work package.
 */
export const useCreateSingleWorkPackage = () => {
  const queryClient = useQueryClient();
  return useMutation<WorkPackage, Error, WorkPackageCreateArgs>(
    ['work packages', 'create'],
    async (wpPayload: WorkPackageCreateArgs) => {
      const { data } = await createSingleWorkPackage(wpPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams', false]); //invalidations for gantt chart
        queryClient.invalidateQueries(['projects']);
      }
    }
  );
};

/**
 * Custom React Hook to edit a work package.
 *
 * @returns React-query utility functions exposed by the useMutation hook
 */
export const useEditWorkPackage = (_wbsNum: WbsNumber) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, WorkPackageEditArgs>(
    ['work packages', 'edit'],
    async (wpPayload: WorkPackageEditArgs) => {
      const { data } = await editWorkPackage(wpPayload);
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
 * Custom React Hook to delete a work package.
 */
export const useDeleteWorkPackage = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, WbsNumber>(
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
  const { selectedCar } = useGlobalCarFilter();
  const filteredWbsNums =
    selectedCar === 'all-cars' ? wbsNums : wbsNums.filter((wbsNum) => wbsNum.carNumber === selectedCar.wbsNum.carNumber);
  const carKey = selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id;
  return useQuery<WorkPackage[], Error>(['work packages', 'many', filteredWbsNums, carKey], async () => {
    const { data } = await getManyWorkPackages(filteredWbsNums);
    return data;
  });
};

/**
 * Custom React Hook to slack upcoming deadlines.
 */
export const useSlackUpcomingDeadlines = () => {
  return useMutation<{ message: string }, Error, Date>(['slack upcoming deadlines'], async (deadline: Date) => {
    const { data } = await slackUpcomingDeadlines(deadline);
    return data;
  });
};

export const useHomeScreenWorkPackages = (selection: WorkPackageSelection) => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<WorkPackage[], Error>(
    ['teams', 'work-packages', selection, selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id],
    async () => {
      const { data } = await getHomePageWorkPackages(selection);
      return data;
    }
  );
};
