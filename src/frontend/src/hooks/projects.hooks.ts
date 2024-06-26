/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link, LinkCreateArgs, LinkType, LinkTypeCreatePayload, Project, WbsNumber, WorkPackageTemplate } from 'shared';
import {
  editSingleProject,
  createSingleProject,
  getAllProjects,
  getSingleProject,
  setProjectTeam,
  deleteProject,
  toggleProjectFavorite,
  getAllLinkTypes,
  createLinkType,
  getAllWorkPackageTemplates,
  editLinkType,
  getAllUsefulLinks,
  setUsefulLinks
} from '../apis/projects.api';
import { CreateSingleProjectPayload, EditSingleProjectPayload } from '../utils/types';
import { useCurrentUser } from './users.hooks';

/**
 * Custom React Hook to supply all projects.
 */
export const useAllProjects = (includeDeleted: boolean = false) => {
  return useQuery<Project[], Error>(['projects'], async () => {
    const { data } = await getAllProjects(includeDeleted);
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

/**
 * Custom React Hook to toggle a user's favorite status on a project.
 */
export const useToggleProjectFavorite = (wbsNumber: WbsNumber) => {
  const queryClient = useQueryClient();
  const user = useCurrentUser();

  return useMutation<{ message: string }, Error>(
    ['projects', 'edit', 'favorite'],
    async () => {
      const { data } = await toggleProjectFavorite(wbsNumber);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects', wbsNumber]);
        queryClient.invalidateQueries(['users', user.userId, 'favorite projects']);
      }
    }
  );
};

/**
 * custom react hook to get all of the link types
 * @returns gets all the link types from the database
 */
export const useAllLinkTypes = () => {
  return useQuery<LinkType[], Error>(['linkTypes'], async () => {
    const { data } = await getAllLinkTypes();
    return data;
  });
};

/**
 * Custom React Hook to create a link type
 */
export const useCreateLinkType = () => {
  const queryClient = useQueryClient();
  return useMutation<LinkType, Error, LinkTypeCreatePayload>(
    ['linkTypes', 'create'],
    async (linkTypeData: LinkTypeCreatePayload) => {
      const { data } = await createLinkType(linkTypeData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['linkTypes']);
      }
    }
  );
};

/**
 * Custom React Hook to get all workpackage templates
 */
export const useAllWorkPackageTemplates = () => {
  return useQuery<WorkPackageTemplate[], Error>(['work package templates'], async () => {
    const { data } = await getAllWorkPackageTemplates();
    return data;
  });
};

/**
 * Custom React Hook to edit a LinkType.
 *
 * @param linkTypeName The name of the LinkType to edit (unique)
 * @returns the edited linkType
 */
export const useEditLinkType = (linkTypeName: string) => {
  const queryClient = useQueryClient();
  return useMutation<LinkType, Error, LinkTypeCreatePayload>(
    ['linkTypes', 'edit'],
    async (formData: LinkTypeCreatePayload) => {
      const { data } = await editLinkType(linkTypeName, formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['linkTypes']);
      }
    }
  );
};

/**
 * Custom React Hook to get all useful links
 */
export const useAllUsefulLinks = () => {
  return useQuery<Link[], Error>(['useful links'], async () => {
    const { data } = await getAllUsefulLinks();
    return data;
  });
};

/**
 * Custom React Hook to set all useful links.
 *
 * @param links All the links to be set
 * @returns all the links
 */
export const useSetUsefulLinks = () => {
  const queryClient = useQueryClient();
  return useMutation<Link[], Error, LinkCreateArgs[]>(
    ['useful links'],
    async (links: LinkCreateArgs[]) => {
      const { data } = await setUsefulLinks({ links });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['useful links']);
      }
    }
  );
};
