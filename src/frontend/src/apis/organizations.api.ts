import axios from '../utils/axios';
import { Organization } from 'shared';
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

/**
 * Sets the contacts for an organization
 * @param contacts all the contact information that is being set
 */
export const updateOrganizationContacts = async (contacts: string[]) => {
  return axios.post<{ message: string }>(apiUrls.organizationsUpdateContacts(), {
    contacts
  });
};
