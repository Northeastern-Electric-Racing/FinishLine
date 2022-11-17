/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { Project, WbsNumber } from 'shared';
import { wbsPipe } from '../utils/Pipes';
import { apiUrls } from '../utils/Urls';
import { projectTransformer } from './Transformers/Projects.transformers';

/**
 * Fetches all projects.
 */
export const getAllProjects = () => {
  return axios.get<Project[]>(apiUrls.projects(), {
    transformResponse: (data) => JSON.parse(data).map(projectTransformer)
  });
};

/**
 * Fetches a single change request.
 *
 * @param wbsNum Project WBS number of the requested project.
 */
export const getSingleProject = (wbsNum: WbsNumber) => {
  return axios.get<Project>(apiUrls.projectsByWbsNum(wbsPipe(wbsNum)), {
    transformResponse: (data) => projectTransformer(JSON.parse(data))
  });
};

/**
 * Create a single project.
 *
 * @param payload Payload containing all information needed to create a project.
 */
export const createSingleProject = (payload: any) => {
  return axios.post<{ message: string }>(apiUrls.projectsCreate(), {
    ...payload
  });
};

/**
 * Edit a single project
 *
 * @param payload Payload containing all information needed to edit a project.
 */
export const editSingleProject = (payload: any) => {
  return axios.post<{ message: string }>(apiUrls.projectsEdit(), {
    ...payload
  });
};
