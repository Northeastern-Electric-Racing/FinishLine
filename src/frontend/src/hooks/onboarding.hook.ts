import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Checklist } from 'shared';
import {
  getAllChecklists,
  getGeneralChecklists,
  getUsersChecklists,
  downloadGoogleImage,
  deleteChecklist,
  toggleChecklist,
  createChecklist,
  editChecklist,
  getCheckedChecklists
} from '../apis/onboarding.api';

export interface ToggleChecklistPayload {
  checklistId: string;
}

export interface ChecklistCreateArgs {
  name: string;
  descriptions: string[];
  isOptional: boolean;
  parentChecklistId?: string;
  teamId?: string;
  teamTypeId?: string;
}

export interface SubtaskCreateArgs {
  name: string;
  isOptional: boolean;
}

export const useAllChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists'], async () => {
    const { data } = await getAllChecklists();
    return data;
  });
};

export const useGeneralChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists', 'general'], async () => {
    const { data } = await getGeneralChecklists();
    return data;
  });
};

export const useCheckedChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists', 'checked'], async () => {
    const { data } = await getCheckedChecklists();
    return data;
  });
};

export const useUsersChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists', 'checklists'], async () => {
    const { data } = await getUsersChecklists();
    return data;
  });
};

export const useDeleteChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['checklists', 'delete'],
    async (checklistId: string) => {
      const { data } = await deleteChecklist(checklistId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['checklists']);
      }
    }
  );
};

export const useToggleChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation<Checklist, Error, ToggleChecklistPayload>(
    ['checklists', 'edit'],
    async (payload) => {
      const { data } = await toggleChecklist(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['checklists']);
      }
    }
  );
};

export const useGetImageUrl = (imageFileId: string | null) => {
  return useQuery<string, Error>(
    ['image', imageFileId],
    async () => {
      if (!imageFileId) throw new Error('No image ID provided');
      const imageBlob = await downloadGoogleImage(imageFileId);
      return URL.createObjectURL(imageBlob);
    },
    {
      enabled: !!imageFileId
    }
  );
};

export const useCreateChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation<Checklist, Error, ChecklistCreateArgs>(
    ['checklists', 'create'],
    async (payload) => {
      const { data } = await createChecklist(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['checklists']);
      }
    }
  );
};

export const useEditChecklist = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Checklist, Error, ChecklistCreateArgs>(
    ['checklists', 'edit'],
    async (payload) => {
      const { data } = await editChecklist(id, payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['checklists']);
      }
    }
  );
};

export const useGetImageUrls = (imageFileIds: (string | null)[]) => {
  return useQuery<string[], Error>(
    ['image', imageFileIds],
    async () => {
      if (!imageFileIds) throw new Error('No image ID provided');
      const imageBlobs = await Promise.all(
        imageFileIds
          .filter((id): id is string => id !== null)
          .map(async (imageId) => {
            const imageBlob = await downloadGoogleImage(imageId);
            return URL.createObjectURL(imageBlob);
          })
      );
      return imageBlobs;
    },
    {
      enabled: !!imageFileIds
    }
  );
};
