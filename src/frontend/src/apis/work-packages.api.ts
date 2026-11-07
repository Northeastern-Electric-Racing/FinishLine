/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import {
  BaseWorkPackage,
  dateToMidnightUTC,
  DescriptionBulletPreview,
  WbsNumber,
  WorkPackageCard,
  WorkPackageDetail,
  WorkPackageStage
} from 'shared';
import { wbsPipe } from '../utils/pipes';
import { apiUrls } from '../utils/urls';
import {
  baseWorkPackageTransformer,
  workPackageCardTransformer,
  workPackageDetailTransformer
} from './transformers/work-packages.transformers';
import { WorkPackageSelection, WorkPackageTimelineFilters } from 'shared';

export interface WorkPackageApiInputs {
  name: string;
  startDate: string;
  duration: number;
  stage: WorkPackageStage | 'NONE';
  crId?: string;
  blockedBy: WbsNumber[];
  descriptionBullets: DescriptionBulletPreview[];
}

export interface WorkPackageCreateArgs extends WorkPackageApiInputs {
  projectWbsNum: WbsNumber;
}

export interface WorkPackageEditArgs extends WorkPackageApiInputs {
  crId: string;
}

/**
 * Fetch a single work package.
 *
 * @param wbsNum Work Package WBS number of the requested work package.
 */
export const getSingleWorkPackage = (wbsNum: WbsNumber) => {
  return axios.get<WorkPackageDetail>(apiUrls.workPackagesByWbsNum(wbsPipe(wbsNum)), {
    transformResponse: (data) => workPackageDetailTransformer(JSON.parse(data))
  });
};

/**
 * Fetch all work packages for a given project
 * @param projectWbsNum the wbs number of the project
 * @returns the work packages for the given project
 */
export const getWorkPackagesByProject = (projectWbsNum: WbsNumber) => {
  return axios.get<BaseWorkPackage[]>(apiUrls.workPackagesByProject(wbsPipe(projectWbsNum)), {
    transformResponse: (data) => JSON.parse(data).map(baseWorkPackageTransformer)
  });
};

/**
 * Create a single work package.
 *
 * @param payload Payload containing all the necessary data to create a work package.
 */
export const createSingleWorkPackage = (payload: WorkPackageCreateArgs) => {
  return axios.post<BaseWorkPackage>(
    apiUrls.workPackagesCreate(),
    { ...payload },
    { transformResponse: (data) => baseWorkPackageTransformer(JSON.parse(data)) }
  );
};

/**
 * Edit a work package.
 *
 * @param payload Object containing required key-value pairs for backend function to edit work package
 */
export const editWorkPackage = (payload: WorkPackageEditArgs) => {
  return axios.post<void>(apiUrls.workPackagesEdit(), {
    ...payload
  });
};

/**
 * Delete a work package.
 *
 * @param wbsNum The WBS Number of the work package being deleted.
 */
export const deleteWorkPackage = (wbsNum: WbsNumber) => {
  return axios.delete<void>(apiUrls.workPackagesDelete(wbsPipe(wbsNum)));
};

/**
 * Get all the work packages that this work package is blocking.
 * @param wbsNum The WBS Number of the work package being changed.
 */
export const getAllBlockingWorkPackages = (wbsNum: WbsNumber) => {
  return axios.get<BaseWorkPackage[]>(apiUrls.workPackagesBlocking(wbsPipe(wbsNum)), {
    transformResponse: (data) => JSON.parse(data).map(baseWorkPackageTransformer)
  });
};

/**
 * Gets the work package corresponding with each wbsNum in the submitted array.
 * @param wbsNums the WBS Numbers of the work packages being fetched.
 */
export const getManyWorkPackages = (wbsNums: WbsNumber[]) => {
  return axios.post<BaseWorkPackage[]>(
    apiUrls.workPackagesMany(),
    { wbsNums },
    {
      transformResponse: (data) => JSON.parse(data).map(baseWorkPackageTransformer)
    }
  );
};

/**
 * Slack upcoming deadlines.
 */
export const slackUpcomingDeadlines = (deadline: Date) => {
  return axios.post<void>(apiUrls.workPackagesSlackUpcomingDeadlines(), {
    deadline: dateToMidnightUTC(deadline)
  });
};

export const getHomePageWorkPackages = (selection: WorkPackageSelection, filters: WorkPackageTimelineFilters) => {
  return axios.get<WorkPackageCard[]>(apiUrls.homePageWorkPackages(selection, filters), {
    transformResponse: (data) => JSON.parse(data).map(workPackageCardTransformer)
  });
};

/**
 * Fetch all work packages in preview format (minimal data for dropdowns/lists).
 */
export const getAllWorkPackagesPreview = (status?: string) => {
  return axios.get<BaseWorkPackage[]>(apiUrls.workPackagesAllPreview(status), {
    transformResponse: (data) => JSON.parse(data).map(baseWorkPackageTransformer)
  });
};
