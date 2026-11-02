/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  AvailableBayDashboardWidgets,
  BayDashboardConfig,
  BayDashboardCountdown,
  BayDashboardCountdownCreateArgs,
  BayDashboardSlotCreateArgs,
  PublicBayDashboardConfig
} from 'shared';
import { apiUrls } from '../utils/urls';
import {
  createBayDashboardCountdown,
  editBayDashboardCountdown,
  getAvailableBayDashboardWidgets,
  getBayDashboardConfig,
  getBayDashboardCountdowns,
  getCurrentBayDashboardConfig,
  saveBayDashboardConfig
} from '../apis/bay-dashboard.api';
import { useToast } from './toasts.hooks';

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
 * Custom React Hook to get the bay dashboard config the public TV display shows.
 * Null if the organization has never saved a config.
 * The key sits under ['bay-dashboard', slug] so the server's update events refetch it.
 * @param slug the organization slug from the /bay-dashboard/:slug route
 */
export const useGetBayDashboardConfig = (slug: string) => {
  return useQuery<PublicBayDashboardConfig | null, Error>(['bay-dashboard', slug, 'config'], async () => {
    const { data } = await getBayDashboardConfig(slug);
    return data;
  });
};

/**
 * Custom React Hook to get an organization's bay dashboard countdowns, for the TV, the Admin Tools preview and the countdown table.
 * The key sits under ['bay-dashboard', slug] so the server's update events refetch it on the TV.
 * @param slug the organization slug
 */
export const useGetBayDashboardCountdowns = (slug: string) => {
  return useQuery<BayDashboardCountdown[], Error>(['bay-dashboard', slug, 'countdowns'], async () => {
    const { data } = await getBayDashboardCountdowns(slug);
    return data;
  });
};

/**
 * Custom React Hook to create a bay dashboard countdown.
 * Errors are left to the caller, the create modal's form submit toasts them.
 * @param slug the organization slug, whose countdowns are refetched after creating
 */
export const useCreateBayDashboardCountdown = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation<BayDashboardCountdown, Error, BayDashboardCountdownCreateArgs>(
    ['bay-dashboard', 'admin', 'countdown', 'create'],
    async (countdown: BayDashboardCountdownCreateArgs) => {
      const { data } = await createBayDashboardCountdown(countdown);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bay-dashboard', slug, 'countdowns']);
      }
    }
  );
};

/**
 * Custom React Hook to get every widget type that can be placed on the bay dashboard
 */
export const useAvailableBayDashboardWidgets = () => {
  return useQuery<AvailableBayDashboardWidgets, Error>(['bay-dashboard', 'admin', 'widgets'], async () => {
    const { data } = await getAvailableBayDashboardWidgets();
    return data;
  });
};

/**
 * Custom React Hook to save a new bay dashboard config, replacing the one the TV is showing.
 */
export const useSaveBayDashboardConfig = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<BayDashboardConfig, Error, BayDashboardSlotCreateArgs[]>(
    ['bay-dashboard', 'admin', 'save'],
    async (slots: BayDashboardSlotCreateArgs[]) => {
      const { data } = await saveBayDashboardConfig(slots);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bay-dashboard', 'admin', 'config']);
        toast.success('Successfully saved widget selections. The TV display has been updated.');
      },
      onError: (error) => {
        toast.error(error.message);
      }
    }
  );
};

/**
 * Custom React Hook to edit a bay dashboard countdown, changing the one the TV is showing.
 * @param slug the organization slug, whose countdowns are refetched after editing
 */
export const useEditBayDashboardCountdown = (slug: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<
    BayDashboardCountdown,
    Error,
    { countdownId: string; name: string; startDate: Date; isPrimary: boolean; endDate?: Date }
  >(
    ['bay-dashboard', 'admin', 'countdown', 'edit'],
    async ({ countdownId, name, startDate, isPrimary, endDate }) => {
      const { data } = await editBayDashboardCountdown(countdownId, name, startDate, isPrimary, endDate);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bay-dashboard', slug, 'countdowns']);
        toast.success('Countdown updated successfully!');
      },
      onError: (error) => {
        toast.error(error.message);
      }
    }
  );
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
