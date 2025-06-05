import { useQueryClient, useMutation, useQuery } from 'react-query';
import { ProjectTemplate, WorkPackageTemplate } from 'shared';
import { getAllWorkPackageTemplates } from '../apis/projects.api';
import {
  editWorkPackageTemplate,
  deleteWorkPackageTemplate,
  getSingleWorkPackageTemplate,
  createSingleWorkPackageTemplate,
  getAllProjectTemplates,
  getSingleProjectTemplate,
  ProjectTemplateApiInputs,
  editProjectTemplate,
  createProjectTemplate,
  deleteProjectTemplate
} from '../apis/wbs-templates.api';

import { WorkPackageTemplateApiInputs } from 'shared';

/**
 * Custom React Hook to edit a work package.
 *
 * @returns React-query utility functions exposed by the useMutation hook
 */
export const useEditWorkPackageTemplate = (workPackageTemplateId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, WorkPackageTemplateApiInputs>(
    ['work package templates', 'edit'],
    async (wptPayload: WorkPackageTemplateApiInputs) => {
      const { data } = await editWorkPackageTemplate(workPackageTemplateId, wptPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['work package templates']);
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
 * Custom React Hook to delete a work package template.
 */
export const useDeleteWorkPackageTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>(
    ['work package templates', 'delete'],
    async (workPackageTemplateId: string) => {
      const { data } = await deleteWorkPackageTemplate(workPackageTemplateId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['work package templates']);
      }
    }
  );
};

/*
 * Custom React Hook to get a single workpackage template
 */
export const useSingleWorkPackageTemplate = (workPackageTemplateId: string) => {
  return useQuery<WorkPackageTemplate, Error>(['work package templates', workPackageTemplateId], async () => {
    const { data } = await getSingleWorkPackageTemplate(workPackageTemplateId);
    return data;
  });
};

/**
 * Custom React Hook to create a workpackage template
 */
export const useCreateSingleWorkPackageTemplate = () => {
  return useMutation<{ message: string }, Error, WorkPackageTemplateApiInputs>(
    ['work package templates', 'create'],
    async (wptPayload: WorkPackageTemplateApiInputs) => {
      const { data } = await createSingleWorkPackageTemplate(wptPayload);
      return data;
    }
  );
};

/**
 * Custom React Hook to get all project templates
 */
export const useAllProjectTemplates = () => {
  return useQuery<ProjectTemplate[], Error>(['project templates'], async () => {
    const { data } = await getAllProjectTemplates();
    return data;
  });
};

/**
 * Custom React Hook to delete a project template
 */
export const useDeleteProjectTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>(
    ['project templates', 'delete'],
    async (projectTemplateId) => {
      const { data } = await deleteProjectTemplate(projectTemplateId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project templates']);
      }
    }
  );
};

/**
 * Custom React Hook to get a single project template
 */
export const useSingleProjectTemplate = (projectTemplateId: string) => {
  return useQuery<ProjectTemplate, Error>(['project templates', projectTemplateId], async () => {
    const { data } = await getSingleProjectTemplate(projectTemplateId);
    return data;
  });
};

export const useEditProjectTemplate = (projectTemplateId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProjectTemplate, Error, ProjectTemplateApiInputs>(
    ['project templates', 'edit'],
    async (payload: ProjectTemplateApiInputs) => {
      const { data } = await editProjectTemplate(projectTemplateId, payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project templates']);
      }
    }
  );
};

/**
 * Custom React Hook to create a project template
 */
export const useCreateProjectTemplate = () => {
  return useMutation<ProjectTemplate, Error, ProjectTemplateApiInputs>(
    ['project templates', 'create'],
    async (payload: ProjectTemplateApiInputs) => {
      const { data } = await createProjectTemplate(payload);
      return data;
    }
  );
};
