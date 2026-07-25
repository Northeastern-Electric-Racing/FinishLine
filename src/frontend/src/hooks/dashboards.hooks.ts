/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQueryClient, useMutation, useQuery } from 'react-query';
import { Dashboard } from 'shared';
import { createDashboard, deleteDashboard, editDashboard, getUserDashboards } from '../apis/dashboards.api';

export interface CreateDashboardPayload {
  name: string;
  link: string;
}

export interface EditDashboardPayload {
  link: string;
}

/**
 * Custom react hook to get the current user's dashboards
 *
 * @returns the current user's dashboards
 */
export const useUserDashboards = () => {
  return useQuery<Dashboard[], Error>(['dashboards'], async () => {
    const { data } = await getUserDashboards();
    return data;
  });
};

/**
 * Custom react hook to create a dashboard
 *
 * @returns the created dashboard
 */
export const useCreateDashboard = () => {
  const queryClient = useQueryClient();
  return useMutation<Dashboard, Error, CreateDashboardPayload>(
    ['dashboards', 'create'],
    async (payload) => {
      const { data } = await createDashboard(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dashboards']);
      }
    }
  );
};

/**
 * Custom react hook to edit a dashboard's saved filters
 *
 * @param dashboardId id of the dashboard to edit
 * @returns the updated dashboard
 */
export const useEditDashboard = (dashboardId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Dashboard, Error, EditDashboardPayload>(
    ['dashboards', 'edit'],
    async (payload) => {
      const { data } = await editDashboard(dashboardId, payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dashboards']);
      }
    }
  );
};

/**
 * Custom react hook to delete a dashboard
 *
 * @param dashboardId id of the dashboard to delete
 * @returns the deleted dashboard
 */
export const useDeleteDashboard = (dashboardId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Dashboard, Error, void>(
    ['dashboards', 'delete'],
    async () => {
      const { data } = await deleteDashboard(dashboardId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dashboards']);
      }
    }
  );
};
