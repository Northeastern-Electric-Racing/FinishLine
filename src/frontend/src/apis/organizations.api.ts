import axios from '../utils/axios';
import { Organization } from 'shared';
import { apiUrls } from '../utils/urls';
import { OnboardingTextPayload } from '../hooks/organizations.hooks';

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
 * Sets onboarding text field
 * @param payload all info needed to create a design review
 */
export const setOnboardingText = (payload: OnboardingTextPayload) => {
  return axios.post(apiUrls.organizationSetOnboardingText(), {
    ...payload
  });
};
