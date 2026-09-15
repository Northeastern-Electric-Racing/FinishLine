/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BayDashboardOrganization } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

/**
 * Gets the organization the public bay dashboard belongs to.
 */
export const getBayDashboardOrganization = () => {
  return axios.get<BayDashboardOrganization>(apiUrls.bayDashboardOrganization(), {
    transformResponse: (data) => JSON.parse(data)
  });
};
