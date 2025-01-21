import axios from '../utils/axios';
import { Organization, Project } from 'shared';
import { apiUrls } from '../utils/urls';
import { ApplicationLinkPayload, OnboardingTextPayload, UpdateContactsPayload } from '../hooks/organizations.hooks';

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
 * @param payload all info needed to set the onboardingText
 */
export const setOnboardingText = (payload: OnboardingTextPayload) => {
  return axios.post(apiUrls.organizationsSetOnboardingText(), {
    ...payload
  });
};

/**
 *
 * @param payload all info needed to update the applicationLink
 */
export const updateApplicationLink = (payload: ApplicationLinkPayload) => {
  return axios.post(apiUrls.organizationsUpdateApplicationLink(), {
    ...payload
  });
};
