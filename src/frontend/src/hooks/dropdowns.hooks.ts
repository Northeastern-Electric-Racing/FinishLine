/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery } from 'react-query';
import { MemberDropdownItem, ProjectDropdownItem, TeamDropdownItem, WorkPackageDropdownItem } from 'shared';
import {
  getAllMembersDropdown,
  getAllProjectsDropdown,
  getAllTeamsDropdown,
  getAllWorkPackagesDropdown
} from '../apis/dropdowns.api';

/**
 * Hooks backing the abstracted dropdown components. Each fetches a minimal ("dropdown") list of items
 * from a dedicated backend endpoint so dropdowns don't over-fetch the full, deeply-nested objects.
 * They fetch once on mount and stay fresh for a while so opening/closing a dropdown never refetches.
 * (Cars are few, so the car dropdown reuses the existing full cars endpoint via useGetAllCars.)
 */

// dropdown option lists rarely change within a session, so keep them fresh for 5 minutes
const DROPDOWN_QUERY_OPTIONS = { staleTime: 1000 * 60 * 5 } as const;

export const useProjectsDropdown = (enabled = true) =>
  useQuery<ProjectDropdownItem[], Error>(['dropdown', 'projects'], async () => (await getAllProjectsDropdown()).data, {
    ...DROPDOWN_QUERY_OPTIONS,
    enabled
  });

export const useWorkPackagesDropdown = () =>
  useQuery<WorkPackageDropdownItem[], Error>(
    ['dropdown', 'work-packages'],
    async () => (await getAllWorkPackagesDropdown()).data,
    DROPDOWN_QUERY_OPTIONS
  );

export const useMembersDropdown = () =>
  useQuery<MemberDropdownItem[], Error>(
    ['dropdown', 'members'],
    async () => (await getAllMembersDropdown()).data,
    DROPDOWN_QUERY_OPTIONS
  );

export const useTeamsDropdown = () =>
  useQuery<TeamDropdownItem[], Error>(
    ['dropdown', 'teams'],
    async () => (await getAllTeamsDropdown()).data,
    DROPDOWN_QUERY_OPTIONS
  );
