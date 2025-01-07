import axios from '../utils/axios';
import { Organization, Project } from 'shared';
import { apiUrls } from '../utils/urls';

/**
 * Create a design review
 * @param payload all info needed to create a design review
 */
export const getCurrentOrganization = async () => {
  return axios.get<Organization>(apiUrls.currentOrganization(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const getFeaturedProjects = async () => {
  return axios.get<Project[]>(apiUrls.organizationsFeaturedProjects(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const setOrganizationDescription = async (description: string) => {
  return axios.post<Organization>(apiUrls.organizationsSetDescription(), {
    description
  });
};

export const getOrganizationLogo = async () => {
  return axios.get<string>(apiUrls.organizationsLogoImage(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const setOrganizationLogo = async (file: File) => {
  const formData = new FormData();
  formData.append('logo', file);
  return axios.post(apiUrls.organizationsSetLogoImage(), formData);
};

export const setOrganizationFeaturedProjects = async (featuredProjectIds: string[]) => {
  return axios.post<Organization>(apiUrls.organizationsSetFeaturedProjects(), {
    projectIds: featuredProjectIds
  });
};

export const setOrganizationWorkspaceId = async (workspaceId: string) => {
  return axios.post<Organization>(apiUrls.organizationsSetWorkspaceId(), {
    workspaceId
  });
};

/**
 * Downloads a given fileId from google drive into a blob
 *
 * @param fileId the google id of the file to download
 * @returns the downloaded file as a Blob
 */
export const downloadGoogleImage = async (fileId: string): Promise<Blob> => {
  const response = await axios.get(apiUrls.imageById(fileId), {
    responseType: 'arraybuffer' // Set the response type to 'arraybuffer' to receive the image as a Buffer
  });
  const imageBuffer = new Uint8Array(response.data);
  const imageBlob = new Blob([imageBuffer], { type: response.headers['content-type'] });
  return imageBlob;
};
