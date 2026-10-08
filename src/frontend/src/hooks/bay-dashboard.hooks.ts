/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { AvailableBayDashboardWidgets, BayDashboardConfig } from 'shared';
import { apiUrls } from '../utils/urls';
import { getAvailableBayDashboardWidgets, getCurrentBayDashboardConfig } from '../apis/bay-dashboard.api';

/**
 * Custom React Hook to get the bay dashboard config currently displayed on the TV, for the Admin Tools preview.
 * Resolves to null if the organization has never saved a config.
 */
export const useGetCurrentBayDashboardConfig = () => {
  return useQuery<BayDashboardConfig | null, Error>(['bay-dashboard', 'admin', 'config'], async () => {
    const { data } = await getCurrentBayDashboardConfig();
    return data;
  });
};

/**
 * Custom React Hook to get every widget type that can be placed on the bay dashboard
 * @param slug the organization's slug
 */
export const useAvailableBayDashboardWidgets = (slug: string) => {
  return useQuery<AvailableBayDashboardWidgets, Error>(['bay-dashboard', slug, 'widgets'], async () => {
    const { data } = await getAvailableBayDashboardWidgets(slug);
    return data;
  });
};

/**
 * Subscribes the public bay dashboard to config changes for one organization. Server sends an empty
 * event whenever an admin saves, then everything under that organization's bay-dashboard query key is refetched.
 *
 * @param slug the organization slug from the /bay-dashboard/:slug route
 */
export const useBayDashboardEvents = (slug: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let source: EventSource;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      const es = new EventSource(apiUrls.bayDashboardEvents(slug));
      source = es;

      // prefix match - this covers every bay dashboard query for this organization
      es.addEventListener('update', () => queryClient.invalidateQueries(['bay-dashboard', slug]));

      es.onerror = () => {
        // a non-200 response closes the connection permanently, so retry after a delay
        if (es.readyState === EventSource.CLOSED) {
          es.close();
          retry = setTimeout(connect, 10_000);
        }
      };
    };

    connect();

    return () => {
      clearTimeout(retry);
      source.close();
    };
  }, [queryClient, slug]);
};
