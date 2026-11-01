/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import {
  AvailableBayDashboardWidgets,
  BayDashboardConfig,
  BayDashboardSlotCreateArgs,
  BayDashboardCountdown,
  PublicBayDashboardConfig
} from 'shared';
import { bayDashboardConfigTransformer, bayDashboardCountdownTransformer } from './transformers/bay-dashboard.transformers';

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
 * Gets the bay dashboard config the TV is displaying for an organization
 * @param slug the organization's slug
 */
export const getBayDashboardConfig = (slug: string) => {
  return axios.get<PublicBayDashboardConfig | null>(apiUrls.bayDashboardConfig(slug), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Gets every widget type that can be placed on the bay dashboard, along with the sizes each supports
 */
export const getAvailableBayDashboardWidgets = () => {
  return axios.get<AvailableBayDashboardWidgets>(apiUrls.bayDashboardAdminWidgets(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Saves a new bay dashboard config for the current organization, replacing the one the TV is showing
 * @param slots the slots to display, any position left out is saved with its default widget
 */
export const saveBayDashboardConfig = (slots: BayDashboardSlotCreateArgs[]) => {
  return axios.post<BayDashboardConfig>(
    apiUrls.bayDashboardAdminSave(),
    { slots },
    { transformResponse: (data) => bayDashboardConfigTransformer(JSON.parse(data)) }
  );
};

/**
 *this edits a countdown on the bay dashboard.
 *@param countdownId the id of the countdown being edited
 *@param name the new name for the countdown
 *@param startDate the new start date of countdown
 *@param endDate the new end date for the countdown (optional)
 *@returns this returns something that is resolved to the update of the countdown object
 */
export const editBayDashboardCountdown = (countdownId: string, name: string, startDate: Date, endDate?: Date) => {
  return axios.post<BayDashboardCountdown>(
    apiUrls.bayDashboardCountdownEdit(countdownId),
    { name, startDate, endDate },
    { transformResponse: (data) => bayDashboardCountdownTransformer(JSON.parse(data)) }
  );
};
