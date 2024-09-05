import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Milestone } from 'shared';
import { createFaq, createMilestone, editFaq, editMilestone, getAllFaqs, getAllMilestones } from '../apis/recruitment.api';
import { FrequentlyAskedQuestion } from 'shared';

export interface MilestonePayload {
  name: string;
  description: string;
  dateOfEvent: Date;
}

export interface FaqPayload {
  question: string;
  answer: string;
}

export const useAllMilestones = () => {
  return useQuery<Milestone[], Error>(['milestones'], async () => {
    const { data } = await getAllMilestones();
    return data;
  });
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

export const useAllFaqs = () => {
  return useQuery<FrequentlyAskedQuestion[], Error>(['faqs'], async () => {
    const { data } = await getAllFaqs();
    return data;
  });
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation<FrequentlyAskedQuestion, Error, FaqPayload>(
    ['faqs', 'create'],
    async (payload) => {
      const { data } = await createFaq(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['faqs']);
      }
    }
  );
};

export const useEditFaq = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<FrequentlyAskedQuestion, Error, FaqPayload>(
    ['faqs', 'edit'],
    async (payload) => {
      const { data } = await editFaq(payload, id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['faqs']);
      }
    }
  );
};
