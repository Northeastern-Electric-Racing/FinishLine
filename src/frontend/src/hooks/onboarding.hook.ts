import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Checklist, ChecklistItemType, ChecklistPreview, User } from 'shared';
import {
  getAllChecklists,
  getGeneralChecklists,
  getUsersChecklists,
  downloadGoogleImage,
  deleteChecklist,
  toggleChecklist,
  createChecklist,
  editChecklist,
  getCheckedChecklists,
  reorderTasks,
  reorderChecklistItems
} from '../apis/onboarding.api';
import { useEffect, useState } from 'react';
import { isChecklistChecked } from '../utils/onboarding.utils';
import { useCurrentUser } from './users.hooks';

export interface ToggleChecklistPayload {
  checklistId: string;
}

export interface ChecklistCreateArgs {
  content: string;
  isOptional: boolean;
  parentChecklistId?: string;
  teamId?: string;
  teamTypeId?: string;
  itemType?: ChecklistItemType;
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
  const currentUser = useCurrentUser();

  type MutationContext = {
    previousChecklists?: Checklist[];
    previousCheckedChecklists?: Checklist[];
  };

  return useMutation<Checklist, Error, ToggleChecklistPayload, MutationContext>(
    ['checklists', 'edit'],
    async (payload) => {
      const { data } = await toggleChecklist(payload);
      return data;
    },
    {
      onMutate: async ({ checklistId }) => {
        // Cancel outgoing queries
        await queryClient.cancelQueries(['checklists']);

        // Snapshot previous values
        const previousChecklists = queryClient.getQueryData<Checklist[]>(['checklists']);
        const previousCheckedChecklists = queryClient.getQueryData<Checklist[]>(['checklists', 'checked']);

        // Optimistically update the checklists cache
        if (previousChecklists && currentUser) {
          const toggleChecklistInTree = (checklists: Checklist[]): Checklist[] => {
            return checklists.map((checklist) => {
              // If this is the checklist we're toggling
              if (checklist.checklistId === checklistId) {
                const isCurrentlyChecked = checklist.usersChecked.some((user) => user.userId === currentUser.userId);
                return {
                  ...checklist,
                  usersChecked: isCurrentlyChecked
                    ? checklist.usersChecked.filter((user) => user.userId !== currentUser.userId)
                    : [...checklist.usersChecked, currentUser as User]
                };
              }

              return checklist;
            });
          };

          const updatedChecklists = toggleChecklistInTree(previousChecklists);
          queryClient.setQueryData(['checklists'], updatedChecklists);
        }

        return { previousChecklists, previousCheckedChecklists };
      },
      onError: (_err, _variables, context) => {
        // Rollback on error
        if (context?.previousChecklists) {
          queryClient.setQueryData(['checklists'], context.previousChecklists);
        }
        if (context?.previousCheckedChecklists) {
          queryClient.setQueryData(['checklists', 'checked'], context.previousCheckedChecklists);
        }
      },
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

export const useReorderTasks = () => {
  const queryClient = useQueryClient();

  type MutationContext = {
    previousChecklists?: Checklist[];
  };

  return useMutation<void, Error, { taskIds: string[] }, MutationContext>(
    ['checklists', 'reorder'],
    async (payload) => {
      await reorderTasks(payload);
    },
    {
      onMutate: async ({ taskIds }) => {
        // Cancel outgoing queries
        await queryClient.cancelQueries(['checklists']);

        // Snapshot previous value
        const previousChecklists = queryClient.getQueryData<Checklist[]>(['checklists']);

        // Optimistically update cache with new order
        if (previousChecklists) {
          const reorderedChecklists = taskIds
            .map((id) => previousChecklists.find((c) => c.checklistId === id))
            .filter((c): c is Checklist => c !== undefined);

          queryClient.setQueryData(['checklists'], reorderedChecklists);
        }

        return { previousChecklists };
      },
      onError: (_err, _variables, context) => {
        // Rollback on error
        if (context?.previousChecklists) {
          queryClient.setQueryData(['checklists'], context.previousChecklists);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['checklists']);
      }
    }
  );
};

export const useReorderChecklistItems = (parentId: string) => {
  const queryClient = useQueryClient();

  type MutationContext = {
    previousChecklists?: Checklist[];
  };

  return useMutation<void, Error, { itemIds: string[] }, MutationContext>(
    ['checklists', 'reorder', parentId],
    async (payload) => {
      await reorderChecklistItems(parentId, payload);
    },
    {
      onMutate: async ({ itemIds }) => {
        // Cancel outgoing queries
        await queryClient.cancelQueries(['checklists']);

        // Snapshot previous value
        const previousChecklists = queryClient.getQueryData<Checklist[]>(['checklists']);

        // Optimistically reorder subtasks within the parent
        if (previousChecklists) {
          const updatedChecklists = previousChecklists.map((checklist) => {
            if (checklist.checklistId === parentId && checklist.subtasks) {
              const subtasksAsChecklists = checklist.subtasks as unknown as Checklist[];
              const reorderedSubtasks = itemIds
                .map((id) => subtasksAsChecklists.find((s) => s.checklistId === id))
                .filter((s): s is Checklist => s !== undefined);
              return { ...checklist, subtasks: reorderedSubtasks as unknown as ChecklistPreview[] };
            }
            return checklist;
          });
          queryClient.setQueryData(['checklists'], updatedChecklists);
        }

        return { previousChecklists };
      },
      onError: (_err, _variables, context) => {
        // Rollback on error
        if (context?.previousChecklists) {
          queryClient.setQueryData(['checklists'], context.previousChecklists);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['checklists']);
      }
    }
  );
};
