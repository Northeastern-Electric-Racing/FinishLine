/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { WbsNumber, WorkPackage, WorkPackageStage } from 'shared';
import { wbsPipe } from '../utils/pipes';
import { apiUrls } from '../utils/urls';
import { workPackageTransformer } from './transformers/work-packages.transformers';

export interface CreateWorkPackageFormInputs {
  name: string;
  startDate: Date;
  duration: number;
  crId: string;
  stage: WorkPackageStage | null;
  wbsNum: string;
  dependencies: { wbsNum: string }[];
  expectedActivities: { bulletId: number; detail: string }[];
  deliverables: { bulletId: number; detail: string }[];
}
/**
 * Fetch all work packages.
 */
export const getAllWorkPackages = (queryParams?: { [field: string]: string }) => {
  return axios.get<WorkPackage[]>(apiUrls.workPackages(queryParams), {
    transformResponse: (data) => JSON.parse(data).map(workPackageTransformer)
  });
};

/**
 * Fetch a single work package.
 *
 * @param wbsNum Work Package WBS number of the requested work package.
 */
export const getSingleWorkPackage = (wbsNum: WbsNumber) => {
  return axios.get<WorkPackage>(apiUrls.workPackagesByWbsNum(wbsPipe(wbsNum)), {
    transformResponse: (data) => workPackageTransformer(JSON.parse(data))
  });
};

/**
 * Create a single work package.
 *
 * @param payload Payload containing all the necessary data to create a work package.
 */
export const createSingleWorkPackage = (payload: CreateWorkPackageFormInputs
  ) => {
  return axios.post<{ message: string }>(apiUrls.workPackagesCreate(), {
    ...payload
  });
};

/**
 * Edit a work package.
 *
 * @param payload Object containing required key-value pairs for backend function to edit work package
 * @returns Promise that will resolve to either a success status code or a fail status code.
 */
export const editWorkPackage = (payload: CreateWorkPackageFormInputs) => {
  return axios.post<{ message: string }>(apiUrls.workPackagesEdit(), {
    ...payload
  });
};
