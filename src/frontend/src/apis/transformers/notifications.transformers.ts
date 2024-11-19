import { Notification } from 'shared';

/**
 * Transforms a notification
 *
 * @param notification Incoming task object supplied by the HTTP response.
 * @returns Properly transformed notification object.
 */
export const notificationTransformer = (notification: Notification): Notification => {
  return {
    ...notification
  };
};
