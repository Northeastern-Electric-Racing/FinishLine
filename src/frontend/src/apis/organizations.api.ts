import axios from '../utils/axios';
import { NotificationChannelPreview, Organization, ProjectPreview } from 'shared';
import { apiUrls } from '../utils/urls';
import {
  ApplicationLinkPayload,
  OnboardingTextPayload,
  UpdateContactsPayload,
  ChannelIdPayload
} from '../hooks/organizations.hooks';

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
  return axios.get<ProjectPreview[]>(apiUrls.organizationsFeaturedProjects(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const getPartReviewGuideLink = async () => {
  return axios.get<string>(apiUrls.organizationsGetPartReviewGuideLink(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const setPartReviewGuideLink = async (guideLink: string) => {
  return axios.post<Organization>(apiUrls.organizationsSetPartReviewGuideLink(), {
    guideLink
  });
};

export const setOrganizationDescription = async (description: string) => {
  return axios.post<Organization>(apiUrls.organizationsSetDescription(), {
    description
  });
};

export const setPlatformDescription = async (platformDescription: string) => {
  return axios.post<Organization>(apiUrls.organizationsSetPlatformDescription(), {
    platformDescription
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

export const setOrganizationNewMemberImage = async (file: File) => {
  const formData = new FormData();
  formData.append('newMemberImage', file);
  return axios.post(apiUrls.organizationsSetNewMemberImage(), formData);
};

export const getOrganizationNewMemberImage = async () => {
  return axios.get<string>(apiUrls.organizationsNewMemberImage(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const setOrganizationPlatformLogoImage = async (file: File) => {
  const formData = new FormData();
  formData.append('platformLogo', file);
  return axios.post<Organization>(apiUrls.organizationsSetPlatformLogoImage(), formData);
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

/**
 * Sets the channel id to which to send sponsorship notifications
 * @param payload contains the channel id
 */
export const setSlackSponsorshipNotificationSlackChannelId = (payload: ChannelIdPayload) => {
  return axios.post(apiUrls.organizationsSetSlackSponsorshipNotificationChannelId(), {
    ...payload
  });
};

/**
 * Gets the finance delegates for an organization
 */
export const getFinanceDelegates = async () => {
  return axios.get(apiUrls.organizationsFinanceDelegates(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Sets the finance delegates for an organization
 * @param userIds the user IDs to set as finance delegates
 */
export const setFinanceDelegates = async (userIds: string[]) => {
  return axios.post(apiUrls.organizationsSetFinanceDelegates(), {
    userIds
  });
};

/**
 * Gets the organization's list of Slack channels events can notify, with their cached names
 */
export const getNotificationChannels = async () => {
  return axios.get<NotificationChannelPreview[]>(apiUrls.organizationsNotificationChannels(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Gets the Slack channels events can notify that are available to the current user: all public
 * channels, plus private channels the user's Slack id is a member of
 */
export const getAvailableNotificationChannels = async () => {
  return axios.get<NotificationChannelPreview[]>(apiUrls.organizationsAvailableNotificationChannels(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Adds a Slack channel that events can notify
 * @param slackChannelId the Slack channel id to add
 */
export const createNotificationChannel = async (slackChannelId: string) => {
  return axios.post<NotificationChannelPreview>(apiUrls.organizationsCreateNotificationChannel(), {
    slackChannelId
  });
};

/**
 * Removes a Slack channel from the organization's notification channel list
 * @param slackChannelId the Slack channel id to remove
 */
export const deleteNotificationChannel = async (slackChannelId: string) => {
  return axios.post<{ slackChannelId: string }>(apiUrls.organizationsDeleteNotificationChannel(), {
    slackChannelId
  });
};
