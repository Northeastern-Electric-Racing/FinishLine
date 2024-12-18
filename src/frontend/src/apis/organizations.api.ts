import axios from '../utils/axios';
import { Organization } from 'shared';
import { apiUrls } from '../utils/urls';
import { OnboardingTextPayload, UpdateContactsPayload } from '../hooks/organizations.hooks';

/**
 * Create a design review
 * @param payload all info needed to create a design review
 */
export const getCurrentOrganization = async () => {
  return axios.get<Organization>(apiUrls.currentOrganization(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const setOrganizationImages = (images: File[]) => {
  const formData = new FormData();

  formData.append('applyInterestImage', images[0]);
  formData.append('exploreAsGuestImage', images[1]);

  return axios.post<{ message: string }>(apiUrls.organizationsSetImages(), formData, {});
};

/**
 * Sets the contacts for an organization
 * @param contacts all the contact information that is being set
 */
export const updateOrganizationContacts = async (payload: UpdateContactsPayload) => {
  return axios.post<Organization>(apiUrls.organizationsUpdateContacts(), {
    ...payload
  });
};

/**
 * Sets onboarding text field
 * @param payload all info needed to create a design review
 */
export const setOnboardingText = (payload: OnboardingTextPayload) => {
  return axios.post(apiUrls.organizationSetOnboardingText(), {
    ...payload
  });
};
