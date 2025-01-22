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
import { useEffect, useState } from 'react';
import { isChecklistChecked } from '../utils/onboarding.utils';

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
  return useQuery<Checklist[], Error>(['checklists'], async () => {
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

export const useGetImageUrls = (imageList: { objectId: string; imageFileId: string | null }[]) => {
  return useQuery<{ id: string; url: string | undefined }[], Error>(
    ['image', imageList],
    async () => {
      const imageBlobsList = await Promise.all(
        imageList.map(async (object) => {
          const imageBlob = object.imageFileId ? await downloadGoogleImage(object.imageFileId) : undefined;
          const url = imageBlob ? URL.createObjectURL(imageBlob) : undefined;
          return { id: object.objectId, url };
        })
      );
      return imageBlobsList;
    },
    {
      enabled: !!imageList
    }
  );
};

export const useChecklistProgress = (parentChecklists: Checklist[], checkedChecklists: Checklist[]) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (parentChecklists.length === 0) {
      setProgress(100);
      return;
    }

    if (!checkedChecklists) return;

    const totalChecklistsLength = parentChecklists.length;

    const completedChecklistsLength = parentChecklists.reduce((count, checklist) => {
      return isChecklistChecked(checkedChecklists, checklist) ? count + 1 : count;
    }, 0);

    setProgress((completedChecklistsLength / totalChecklistsLength) * 100);
  }, [parentChecklists, checkedChecklists]);

  return progress;
};
