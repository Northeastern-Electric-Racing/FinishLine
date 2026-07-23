/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery } from 'react-query';
import { SlimCar, SlimProject, SlimTeam, SlimUser, SlimWorkPackage } from 'shared';
import { getSlimCars, getSlimProjects, getSlimTeams, getSlimUsers, getSlimWorkPackages } from '../apis/dropdowns.api';

/**
 * Hooks backing the abstracted dropdown components. Each fetches a minimal ("slim") list of items
 * from a dedicated backend endpoint so dropdowns don't over-fetch the full, deeply-nested objects.
 * They fetch once on mount and stay fresh for a while so opening/closing a dropdown never refetches.
 */

// dropdown option lists rarely change within a session, so keep them fresh for 5 minutes
const SLIM_QUERY_OPTIONS = { staleTime: 1000 * 60 * 5 } as const;

export const useSlimCars = () =>
  useQuery<SlimCar[], Error>(['slim', 'cars'], async () => (await getSlimCars()).data, SLIM_QUERY_OPTIONS);

export const useSlimProjects = () =>
  useQuery<SlimProject[], Error>(['slim', 'projects'], async () => (await getSlimProjects()).data, SLIM_QUERY_OPTIONS);

export const useSlimWorkPackages = () =>
  useQuery<SlimWorkPackage[], Error>(
    ['slim', 'work-packages'],
    async () => (await getSlimWorkPackages()).data,
    SLIM_QUERY_OPTIONS
  );

export const useSlimUsers = () =>
  useQuery<SlimUser[], Error>(['slim', 'users'], async () => (await getSlimUsers()).data, SLIM_QUERY_OPTIONS);

export const useSlimTeams = () =>
  useQuery<SlimTeam[], Error>(['slim', 'teams'], async () => (await getSlimTeams()).data, SLIM_QUERY_OPTIONS);
