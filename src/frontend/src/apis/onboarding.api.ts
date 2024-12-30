import { Checklist } from 'shared';
import { apiUrls } from '../utils/urls';
import axios from '../utils/axios';
import { ToggleChecklistPayload } from '../hooks/onboarding.hook';

/**
 * API call to fetch all the checklists
 */
export const getAllChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.allChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * API call to fetch the general checklists
 */
export const getGeneralChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.generalChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * API call to fetch the checked checklists
 */
export const getCheckedChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.checkedChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * API call to fetch all the users checklists
 */
export const getUsersChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.usersTeamTypeChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * API call to toggle a checklist
 */
export const toggleChecklist = (checklistId: string) => {
  return axios.post<{ message: string }>(apiUrls.toggleChecklist(checklistId));
};

/**
 * API Call to download a google image
 * @param fileId file id to be downloaded
 * @returns an image blob
 */
export const downloadGoogleImage = async (fileId: string): Promise<Blob> => {
  const response = await axios.get(apiUrls.imageById(fileId), {
    responseType: 'arraybuffer' // Set the response type to 'arraybuffer' to receive the image as a Buffer
  });
  const imageBuffer = new Uint8Array(response.data);
  const imageBlob = new Blob([imageBuffer], { type: response.headers['content-type'] });
  return imageBlob;
};
