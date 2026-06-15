import axios from '../utils/axios';
import { MilestonePayload, FaqPayload, GuestDefinitionPayload } from '../hooks/recruitment.hooks';
import { apiUrls } from '../utils/urls';
import { dateToMidnightUTC, GuestDefinition, Milestone } from 'shared';
import { FrequentlyAskedQuestion } from 'shared';

export const getAllMilestones = () => {
  return axios.get<Milestone[]>(apiUrls.allMilestones(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const createMilestone = (payload: MilestonePayload) => {
  return axios.post(apiUrls.milestoneCreate(), {
    ...payload,
    dateOfEvent: dateToMidnightUTC(payload.dateOfEvent)
  });
};

export const editMilestone = (payload: MilestonePayload, id: string) => {
  return axios.post(apiUrls.milestoneEdit(id), {
    ...payload,
    dateOfEvent: dateToMidnightUTC(payload.dateOfEvent)
  });
};

export const deleteMilestone = (milestoneId: string) => {
  return axios.delete<{ message: string }>(apiUrls.milestoneDelete(milestoneId));
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

export const deleteFaq = (faqId: string) => {
  return axios.delete<{ message: string }>(apiUrls.faqDelete(faqId));
};

export const getAllGuestDefinitions = () => {
  return axios.get<GuestDefinition[]>(apiUrls.allGuestDefinitions(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const deleteGuestDefinition = (definitionId: string) => {
  return axios.delete<{ message: string }>(apiUrls.guestDefinitionDelete(definitionId));
};

export const createGuestDefinition = (payload: GuestDefinitionPayload) => {
  return axios.post(apiUrls.guestDefinitionCreate(), {
    ...payload
  });
};

export const editGuestDefinition = (payload: GuestDefinitionPayload, id: string) => {
  return axios.post(apiUrls.guestDefintionEdit(id), {
    ...payload
  });
};
