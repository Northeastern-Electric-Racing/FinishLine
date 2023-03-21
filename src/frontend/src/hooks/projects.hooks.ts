/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Project, WbsNumber } from 'shared';
import {
  editSingleProject,
  createSingleProject,
  getAllProjects,
  getSingleProject,
  setProjectTeam,
  deleteProject
} from '../apis/projects.api';
import { CreateSingleProjectPayload, EditSingleProjectPayload } from '../utils/types';

/**
 * Custom React Hook to supply all projects.
 */
export const useAllProjects = () => {
  return useQuery<Project[], Error>(['projects'], async () => {
    const { data } = await getAllProjects();
    return data;
  });
};

/**
 * Custom React Hook to supply a single project.
 *
 * @param wbsNum WBS number of the requested project.
 */
export const useSingleProject = (wbsNum: WbsNumber) => {
  return useQuery<Project, Error>(['projects', wbsNum], async () => {
    const { data } = await getSingleProject(wbsNum);
    return data;
  });
};

/**
 * Custom React Hook to create a new project.
 *
 */
export const useCreateSingleProject = () => {
  return useMutation<{ message: string }, Error, CreateSingleProjectPayload>(
    ['projects', 'create'],
    async (projectPayload: CreateSingleProjectPayload) => {
      const { data } = await createSingleProject(projectPayload);
      return data;
    }
  );
};

/**
 * Custom React Hook to edit a project
 */
export const useEditSingleProject = (wbsNum: WbsNumber) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, EditSingleProjectPayload>(
    ['projects', 'edit'],
    async (projectPayload: EditSingleProjectPayload) => {
      const { data } = await editSingleProject(projectPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects', wbsNum]);
      }
    }
  );
};

/**
 * Custom React Hook to set the team for a project
 * @param wbsNum the project to set the team for
 * @param teamId the id of the team to set the project to
 */
export const useSetProjectTeam = (wbsNum: WbsNumber) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['projects', 'edit', 'teams'],
    async (teamId: string) => {
      const { data } = await setProjectTeam(wbsNum, teamId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
        queryClient.invalidateQueries(['projects', wbsNum]);
      }
    }
  );
};

/**
 * Custom React Hook to delete a work package.
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['projects', 'delete'],
    async (wbsNumber: WbsNumber) => {
      const { data } = await deleteProject(wbsNumber);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );
};
