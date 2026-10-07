/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Dashboard } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { CreateDashboardPayload, EditDashboardPayload } from '../hooks/dashboards.hooks';

export const getUserDashboards = () => {
  return axios.get<Dashboard[]>(apiUrls.dashboardsGet(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const createDashboard = (payload: CreateDashboardPayload) => {
  return axios.post<Dashboard>(apiUrls.dashboardsCreate(), payload);
};

export const editDashboard = (id: string, payload: EditDashboardPayload) => {
  return axios.post<Dashboard>(apiUrls.dashboardEdit(id), payload);
};

export const deleteDashboard = (id: string) => {
  return axios.post<Dashboard>(apiUrls.dashboardDelete(id));
};
