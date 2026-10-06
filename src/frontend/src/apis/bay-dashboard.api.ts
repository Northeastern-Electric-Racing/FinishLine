/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { AvailableBayDashboardWidgets, BayDashboardConfig } from 'shared';
import { bayDashboardConfigTransformer } from './transformers/bay-dashboard.transformers';

/**
 * Gets the bay dashboard config currently displayed on the TV for the current organization
 */
export const getCurrentBayDashboardConfig = () => {
  return axios.get<BayDashboardConfig | null>(apiUrls.bayDashboardAdmin(), {
    transformResponse: (data) => {
      const config: BayDashboardConfig | null = JSON.parse(data);
      return config ? bayDashboardConfigTransformer(config) : null;
    }
  });
};

/**
 * Gets every widget type that can be placed on the bay dashboard, along with the sizes each supports
 * @param slug the organization's slug
 */
export const getAvailableBayDashboardWidgets = (slug: string) => {
  return axios.get<AvailableBayDashboardWidgets>(apiUrls.bayDashboardWidgets(slug), {
    transformResponse: (data) => JSON.parse(data)
  });
};
