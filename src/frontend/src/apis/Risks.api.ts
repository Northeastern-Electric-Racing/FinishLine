/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from 'axios';
import { Risk } from 'shared';
import { apiUrls } from '../utils/Urls';

/**
 * Get the risks for a given project.
 *
 * @param projectId ID of given project.
 */
export const getRisksForProject = (projectId: number) => {
  return axios.get<Risk[]>(apiUrls.risksByProjectId(projectId));
};

/**
 * Create a single risk.
 *
 * @param payload Payload containing all information needed to create a risk.
 */
export const createSingleRisk = (payload: any) => {
  return axios.post<{ message: string }>(apiUrls.risksCreate(), {
    ...payload
  });
};

/**
 * Edit a single risk.
 */
export const editSingleRisk = (payload: any) => {
  return axios.post<{ message: string }>(apiUrls.risksEdit(), {
    ...payload
  });
};

/**
 * Delete a single risk.
 */
export const deleteSingleRisk = (payload: any) => {
  return axios.post<{ message: string }>(apiUrls.risksDelete(), {
    ...payload
  });
};
