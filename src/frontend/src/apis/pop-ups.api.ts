import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { PopUp } from 'shared';

/*
 * Gets all unread notifications of the user with the given id
 */
export const getPopUps = () => {
  return axios.get<PopUp[]>(apiUrls.popUpsCurrentUser(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/*
 * Removes a notification from the user with the given id
 */
export const removePopUps = (notificationId: string) => {
  return axios.post<PopUp[]>(apiUrls.popUpsRemove(notificationId));
};
