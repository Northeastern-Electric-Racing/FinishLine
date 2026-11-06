/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import {
  AvailableBayDashboardWidgets,
  BayDashboardConfig,
  BayDashboardCountdown,
  BayDashboardCountdownCreateArgs,
  BayDashboardSlotCreateArgs,
  dateToMidnightUTC,
  PublicBayDashboardCalendarEvent,
  PublicBayDashboardConfig
} from 'shared';
import {
  bayDashboardConfigTransformer,
  bayDashboardCountdownTransformer,
  publicBayDashboardCalendarEventTransformer
} from './transformers/bay-dashboard.transformers';

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
 * Gets the upcoming calendar events the TV is displaying for an organization
 * @param slug the organization's slug
 */
export const getBayDashboardCalendarEvents = (slug: string) => {
  return axios.get<PublicBayDashboardCalendarEvent[]>(apiUrls.bayDashboardCalendar(slug), {
    transformResponse: (data) =>
      (JSON.parse(data) as PublicBayDashboardCalendarEvent[]).map(publicBayDashboardCalendarEventTransformer)
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
 * Gets the non-deleted countdowns for an organization's bay dashboard
 * @param slug the organization's slug
 */
export const getBayDashboardCountdowns = (slug: string) => {
  return axios.get<BayDashboardCountdown[]>(apiUrls.bayDashboardCountdowns(slug), {
    transformResponse: (data) => JSON.parse(data).map(bayDashboardCountdownTransformer)
  });
};

/**
 * Creates a countdown for the current organization's bay dashboard
 * @param countdown the countdown to create, marking it primary unsets any other primary countdown
 */
export const createBayDashboardCountdown = (countdown: BayDashboardCountdownCreateArgs) => {
  const payload = {
    ...countdown,
    // countdown dates are calendar days, so send the picked day at midnight UTC rather than the local time
    startDate: dateToMidnightUTC(countdown.startDate),
    endDate: countdown.endDate && dateToMidnightUTC(countdown.endDate)
  };
  return axios.post<BayDashboardCountdown>(apiUrls.bayDashboardAdminCountdownCreate(), payload, {
    transformResponse: (data) => bayDashboardCountdownTransformer(JSON.parse(data))
  });
};
