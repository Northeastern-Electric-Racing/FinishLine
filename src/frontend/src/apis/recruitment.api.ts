import axios from '../utils/axios';
import { MilestonePayload } from '../hooks/recruitment.hooks';
import { apiUrls } from '../utils/urls';
import { Milestone } from 'shared/src/types/milestone-types';

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

export const getAllMilestones = () => {
  return axios.get<Milestone[]>(apiUrls.allMilestones(), {
    transformResponse: (data) => JSON.parse(data)
  });
};
