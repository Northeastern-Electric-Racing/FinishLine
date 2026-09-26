/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { apiUrls } from '../utils/urls';

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
