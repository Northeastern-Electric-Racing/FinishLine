/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery } from 'react-query';
import { BayDashboardOrganization } from 'shared';
import { getBayDashboardOrganization } from '../apis/bay-dashboard.api';

/**
 * Custom react hook to get the organization the public bay dashboard belongs to.
 *
 * @returns the public bay dashboard's organization
 */
export const useBayDashboardOrganization = () => {
  return useQuery<BayDashboardOrganization, Error>(['bay-dashboard', 'organization'], async () => {
    const { data } = await getBayDashboardOrganization();
    return data;
  });
};
