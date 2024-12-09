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
