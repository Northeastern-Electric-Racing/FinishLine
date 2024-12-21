import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Notification } from 'shared';

/*
 * Gets all unread notifications of the user with the given id
 */
export const getNotifications = () => {
  return axios.get<Notification[]>(apiUrls.notificationsCurrentUser(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/*
 * Removes a notification from the user with the given id
 */
export const removeNotification = (notificationId: string) => {
  return axios.post<Notification[]>(apiUrls.notificationsRemoveCurrentUser(), { notificationId });
};
