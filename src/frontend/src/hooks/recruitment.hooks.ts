import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Milestone } from 'shared/src/types/milestone-types';
import { createMilestone, editMilestone, getAllMilestones } from '../apis/recruitment.api';

export interface MilestonePayload {
  name: string;
  description: string;
  dateOfEvent: Date;
}

export interface FaqPayload {
  question: string;
  answer: string;
}

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation<Milestone, Error, MilestonePayload>(
    ['milestones', 'create'],
    async (payload) => {
      const { data } = await createMilestone(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['milestones']);
      }
    }
  );
};

export const useEditMilestone = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Milestone, Error, MilestonePayload>(
    ['milestones', 'edit'],
    async (payload) => {
      const { data } = await editMilestone(payload, id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['milestones']);
      }
    }
  );
};

export const useAllMilestones = () => {
  return useQuery<Milestone[], Error>(['milestones'], async () => {
    const { data } = await getAllMilestones();
    return data;
  });
};
