/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { DescriptionBulletPreview, WbsNumber, WorkPackage, WorkPackageStage, WorkPackageTemplate } from 'shared';
import { wbsPipe } from '../utils/pipes';
import { apiUrls } from '../utils/urls';
import { workPackageTransformer } from './transformers/work-packages.transformers';
import { workPackageTemplateTransformer } from './transformers/work-package-templates.transformer';

export interface WorkPackageApiInputs {
  name: string;
  startDate: string;
  duration: number;
  crId: string | undefined;
  stage?: WorkPackageStage;
  blockedBy: WbsNumber[];
  descriptionBullets: DescriptionBulletPreview[];
}

export interface WorkPackageTemplateApiInputs {
  templateName: string;
  templateNotes: string;
  duration: number | undefined;
  stage?: WorkPackageStage;
  blockedBy: string[];
  descriptionBullets: DescriptionBulletPreview[];
  workPackageName?: string;
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
export const createSingleWorkPackage = (payload: WorkPackageApiInputs) => {
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
export const editWorkPackage = (payload: WorkPackageApiInputs) => {
  return axios.post<{ message: string }>(apiUrls.workPackagesEdit(), {
    ...payload
  });
};

/**
 * Edit a work package template.
 *
 * @param payload Object containing required key-value pairs for backend function to edit work package
 * @returns Promise that will resolve to either a success status code or a fail status code.
 */
export const editWorkPackageTemplate = (workPackageTempateId: string, payload: WorkPackageTemplateApiInputs) => {
  return axios.post<{ message: string }>(apiUrls.workPackageTemplatesEdit(workPackageTempateId), {
    ...payload
  });
};

/**
 * Delete a work package.
 *
 * @param wbsNum The WBS Number of the work package being deleted.
 */
export const deleteWorkPackage = (wbsNum: WbsNumber) => {
  return axios.delete<{ message: string }>(apiUrls.workPackagesDelete(wbsPipe(wbsNum)));
};

/**
 * Get all the work packages that this work package is blocking.
 * @param wbsNum The WBS Number of the work package being changed.
 */
export const getAllBlockingWorkPackages = (wbsNum: WbsNumber) => {
  return axios.get<WorkPackage[]>(apiUrls.workPackagesBlocking(wbsPipe(wbsNum)), {
    transformResponse: (data) => JSON.parse(data).map(workPackageTransformer)
  });
};

/**
 * Gets the work package corresponding with each wbsNum in the submitted array.
 * @param wbsNums the WBS Numbers of the work packages being fetched.
 */
export const getManyWorkPackages = (wbsNums: WbsNumber[]) => {
  return axios.post<WorkPackage[]>(
    apiUrls.workPackagesMany(),
    { wbsNums },
    {
      transformResponse: (data) => JSON.parse(data).map(workPackageTransformer)
    }
  );
};

/**
 * Slack upcoming deadlines.
 */
export const slackUpcomingDeadlines = (deadline: Date) => {
  return axios.post<{ message: string }>(apiUrls.workPackagesSlackUpcomingDeadlines(), {
    deadline
  });
};

/**
 * Gets all the workpackage templates from the database
 * @returns gets all the workpackage templates
 */
export const getAllWorkPackageTemplates = () => {
  return axios.get<WorkPackageTemplate[]>(apiUrls.workPackageTemplates(), {
    transformResponse: (data) => JSON.parse(data).map(workPackageTemplateTransformer)
  });
};

/**
 * Delete a work package template.
 *
 * @param workPackageTemplateId The work package template id to be deleted.
 */
export const deleteWorkPackageTemplate = (workPackageTemplateId: string) => {
  return axios.delete<{ message: string }>(apiUrls.workPackageTemplateDelete(workPackageTemplateId));
};

/*
 * Gets a single work package template from the database
 * @returns a single work package template
 */
export const getSingleWorkPackageTemplate = (workPackageTemplateId: string) => {
  return axios.get<WorkPackageTemplate>(apiUrls.workPackageTemplatesById(workPackageTemplateId), {
    transformResponse: (data) => workPackageTemplateTransformer(JSON.parse(data))
  });
};

/**
 * Create a single work package template.
 *
 * @param payload Payload containing all the necessary data to create a work package template.
 */
export const createSingleWorkPackageTemplate = (payload: WorkPackageTemplateApiInputs) => {
  return axios.post<{ message: string }>(apiUrls.workPackageTemplatesCreate(), {
    ...payload
  });
};
