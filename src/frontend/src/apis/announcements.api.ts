import { AnnouncementPage } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { announcementPageTransformer } from './transformers/announcements.transformer';

/*
 * Gets one page of the current user's unread announcements, starting after the given cursor
 */
export const getAnnouncementsPage = (cursor?: string) => {
  return axios.get<AnnouncementPage>(apiUrls.announcementsCurrentUser(), {
    params: { cursor },
    transformResponse: (data) => announcementPageTransformer(JSON.parse(data))
  });
};

/*
 * Removes an announcement from the current user's unread announcements
 */
export const removeAnnouncement = (announcementId: string) => {
  return axios.post(apiUrls.announcementsRemove(announcementId));
};
