import { Announcement } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { announcementsTransformer } from './transformers/announcements.transformer';

/*
 * Gets all unread announcement of the user with the given id
 */
export const getAnnouncements = () => {
  return axios.get<Announcement[]>(apiUrls.announcementsCurrentUser(), {
    transformResponse: (data) => JSON.parse(data).map(announcementsTransformer)
  });
};

/*
 * Removes a notification from the user with the given id
 */
export const removeAnnouncement = (announcementId: string) => {
  return axios.post<Announcement[]>(
    apiUrls.announcementsRemove(announcementId),
    {},
    {
      transformResponse: (data) => JSON.parse(data).map(announcementsTransformer)
    }
  );
};
