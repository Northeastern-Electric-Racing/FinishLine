import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Milestone } from 'shared/src/types/milestone-types';
import { createMilestone, deleteFaq, deleteMilestone, editMilestone, getAllMilestones } from '../apis/recruitment.api';

export interface MilestonePayload {
  name: string;
  description: string;
  dateOfEvent: Date;
}

export interface FaqPayload {
  question: string;
  answer: string;
}

export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['milestones', 'delete'],
    async (milestoneId: string) => {
      const { data } = await deleteMilestone(milestoneId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['milestones']);
      }
    }
  );
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['faqs', 'delete'],
    async (faqId: string) => {
      const { data } = await deleteFaq(faqId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['faqs']);
      }
    }
  );
};

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
