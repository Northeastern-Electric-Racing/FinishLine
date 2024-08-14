import axios from '../utils/axios';
import { MilestonePayload, FaqPayload } from '../hooks/recruitment.hooks';
import { apiUrls } from '../utils/urls';
import { Milestone } from 'shared/src/types/milestone-types';
import { FrequentlyAskedQuestion } from 'shared/src/types/frequently-asked-questions-types';


export const getAllMilestones = () => {
  return axios.get<Milestone[]>(apiUrls.allMilestones(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const createMilestone = (payload: MilestonePayload) => {
  return axios.post(apiUrls.milestoneCreate(), {
    ...payload
  });
};

export const editMilestone = (payload: MilestonePayload, id: string) => {
  return axios.post(apiUrls.milestoneEdit(id), {
    ...payload
  });
};

export const getAllFaqs = () => {
  return axios.get<FrequentlyAskedQuestion[]>(apiUrls.allFaqs(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const createFaq = (payload: FaqPayload) => {
  return axios.post(apiUrls.faqCreate(), {
    ...payload
  });
};

export const editFaq = (payload: FaqPayload, id: string) => {
  return axios.post(apiUrls.faqEdit(id), {
    ...payload
  });
};