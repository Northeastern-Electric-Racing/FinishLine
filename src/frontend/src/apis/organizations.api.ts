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

export const getCurrentFeaturedProject =async () => {
  return axios.get<Project[]>(apiUrls.organizationsFeaturedProjects(), {
    transformResponse: (data) => JSON.parse(data)
  })
}
