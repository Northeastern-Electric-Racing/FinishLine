/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  BaseWorkPackage,
  WbsNumber,
  WorkPackageCard,
  WorkPackageDetail,
  WorkPackageSelection,
  WorkPackageTimelineFilters
} from 'shared';
import { wbsPipe } from '../utils/pipes';
import {
  createSingleWorkPackage,
  deleteWorkPackage,
  editWorkPackage,
  getAllBlockingWorkPackages,
  getAllWorkPackages,
  getManyWorkPackages,
  getSingleWorkPackage,
  getWorkPackagesByProject,
  slackUpcomingDeadlines,
  WorkPackageCreateArgs,
  WorkPackageEditArgs,
  getHomePageWorkPackages
} from '../apis/work-packages.api';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';

// kept under 'teams' so team changes (which decide whose work packages the home page shows) still refresh it;
// work package mutations invalidate it explicitly
export const HOME_PAGE_WORK_PACKAGES_KEY = ['teams', 'work-packages'];

/**
 * Custom React Hook to supply all work packages as the base model (enough for dropdowns and lists).
 */
export const useAllWorkPackages = (status?: string) => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<BaseWorkPackage[], Error>(
    ['work packages', 'all', status, selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id],
    async () => {
      const { data } = await getAllWorkPackages(status);
      return data;
    }
  );
};

/**
 * Custom React Hook to supply a single work package.
 *
 * @param wbsNum WBS number of the requested work package.
 */
export const useSingleWorkPackage = (wbsNum: WbsNumber, enabled = true) => {
  return useQuery<WorkPackageDetail, Error>(
    ['work packages', wbsNum],
    async () => {
      const { data } = await getSingleWorkPackage(wbsNum);
      return data;
    },
    { enabled }
  );
};

/**
 * Custom React Hook to get all work packages for a given project
 * @param projectWbsNum the wbs number of the project
 */
export const useWorkPackagesByProject = (projectWbsNum: WbsNumber, enabled = true) => {
  return useQuery<BaseWorkPackage[], Error>(
    ['work packages', 'by-project', wbsPipe(projectWbsNum)],
    async () => {
      const { data } = await getWorkPackagesByProject(projectWbsNum);
      return data;
    },
    { enabled }
  );
};

/**
 * Custom React Hook to create a new work package.
 *
 * @param wpPayload Payload containing all information needed to create a work package.
 */
export const useCreateSingleWorkPackage = () => {
  const queryClient = useQueryClient();
  return useMutation<BaseWorkPackage, Error, WorkPackageCreateArgs>(
    ['work packages', 'create'],
    async (wpPayload: WorkPackageCreateArgs) => {
      const { data } = await createSingleWorkPackage(wpPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams', false]); //invalidations for gantt chart
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['work packages']);
        queryClient.invalidateQueries(HOME_PAGE_WORK_PACKAGES_KEY);
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
  return useMutation<void, Error, WorkPackageEditArgs>(
    ['work packages', 'edit'],
    async (wpPayload: WorkPackageEditArgs) => {
      await editWorkPackage(wpPayload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['work packages']);
        queryClient.invalidateQueries(HOME_PAGE_WORK_PACKAGES_KEY);
      }
    }
  );
};

/**
 * Custom React Hook to delete a work package.
 */
export const useDeleteWorkPackage = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, WbsNumber>(
    ['work packages', 'delete'],
    async (wbsNum: WbsNumber) => {
      await deleteWorkPackage(wbsNum);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['work packages']);
        queryClient.invalidateQueries(HOME_PAGE_WORK_PACKAGES_KEY);
      }
    }
  );
};

/**
 * Custom React Hook to get all blocking work packages
 */
export const useGetBlockingWorkPackages = (wbsNum: WbsNumber | undefined, enabled = true) => {
  return useQuery<BaseWorkPackage[], Error>(
    ['work packages', 'blocking', wbsNum],
    async () => {
      // only runs when wbsNum is set, per `enabled` below
      const { data } = await getAllBlockingWorkPackages(wbsNum!);
      return data;
    },
    { enabled: enabled && !!wbsNum }
  );
};

/**
 * Custom React Hook to get many work packages
 */
export const useGetManyWorkPackages = (wbsNums: WbsNumber[]) => {
  const { selectedCar } = useGlobalCarFilter();
  const filteredWbsNums =
    selectedCar === 'all-cars' ? wbsNums : wbsNums.filter((wbsNum) => wbsNum.carNumber === selectedCar.wbsNum.carNumber);
  const carKey = selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id;
  return useQuery<BaseWorkPackage[], Error>(['work packages', 'many', filteredWbsNums, carKey], async () => {
    const { data } = await getManyWorkPackages(filteredWbsNums);
    return data;
  });
};

/**
 * Custom React Hook to slack upcoming deadlines.
 */
export const useSlackUpcomingDeadlines = () => {
  return useMutation<void, Error, Date>(['slack upcoming deadlines'], async (deadline: Date) => {
    await slackUpcomingDeadlines(deadline);
  });
};

/**
 * Custom React Hook to get the home page work packages
 * @param selection whose work packages to get
 * @param filters when they run; pass dates that stay the same between renders (e.g. from useState) so the query
 * doesn't refetch every render
 */
export const useHomeScreenWorkPackages = (selection: WorkPackageSelection, filters: WorkPackageTimelineFilters = {}) => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<WorkPackageCard[], Error>(
    [
      ...HOME_PAGE_WORK_PACKAGES_KEY,
      selection,
      JSON.stringify(filters),
      selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id
    ],
    async () => {
      const { data } = await getHomePageWorkPackages(selection, filters);
      return data;
    }
  );
};
