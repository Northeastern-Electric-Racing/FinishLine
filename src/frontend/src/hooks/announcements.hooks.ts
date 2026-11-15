import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { AnnouncementPage } from 'shared';
import { getAnnouncementsPage, removeAnnouncement } from '../apis/announcements.api';

/**
 * Custom react hook to page through the current user's unread announcements, newest first
 */
export const useUserAnnouncements = () => {
  // under ['announcements', 'current-user'] so useRemoveUserAnnouncement's invalidation refetches the loaded pages
  return useInfiniteQuery<AnnouncementPage, Error>(
    ['announcements', 'current-user', 'paginated'],
    async ({ pageParam }: { pageParam?: string }) => {
      const { data } = await getAnnouncementsPage(pageParam);
      return data;
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
};

/**
 * Custom react hook to remove an announcement from the current user's unread announcements
 */
export const useRemoveUserAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>(
    ['announcements', 'current-user', 'remove'],
    async (announcementId: string) => {
      await removeAnnouncement(announcementId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['announcements', 'current-user']);
      }
    }
  );
};
