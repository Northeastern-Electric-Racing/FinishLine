import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Announcement } from 'shared';
import { getAnnouncements, removeAnnouncement } from '../apis/announcements.api';

/**
 * Curstom react hook to get all unread announcements from a user
 * @param userId id of user to get unread announcements from
 * @returns
 */
export const useUserAnnouncements = () => {
  return useQuery<Announcement[], Error>(['announcements', 'current-user'], async () => {
    const { data } = await getAnnouncements();
    return data;
  });
};

/**
 * Curstom react hook to remove a announcement from a user's unread announcements
 * @param userId id of user to get unread announcements from
 * @returns
 */
export const useRemoveUserAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation<Notification[], Error, Announcement>(
    ['announcements', 'current-user', 'remove'],
    async (announcement: Announcement) => {
      const { data } = await removeAnnouncement(announcement.announcementId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['announcements', 'current-user']);
      }
    }
  );
};
