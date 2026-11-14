import { useCallback, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import ScrollablePageBlock from './ScrollablePageBlock';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import GeneralAnnouncementCard from './GeneralAnnouncementCard';
import { useRemoveUserAnnouncement, useUserAnnouncements } from '../../../hooks/announcements.hooks';
import ErrorPage from '../../ErrorPage';

const NoGeneralAnnouncementsDisplay = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 72 }} />}
      heading={"You're all caught up!"}
      message={'You have read all current general announcements!'}
    />
  );
};

const GeneralAnnouncements: React.FC = () => {
  const {
    data,
    isLoading,
    isError: announcementsIsError,
    error: announcementsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useUserAnnouncements();
  const { mutateAsync: removeAnnouncement, isLoading: removeAnnouncementIsLoading } = useRemoveUserAnnouncement();

  // the sentinel below the last card loads the next page once it scrolls into view
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef(() => {});
  loadMoreRef.current = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };
  const setSentinel = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMoreRef.current();
    });
    observerRef.current.observe(node);
  }, []);
  useEffect(() => () => observerRef.current?.disconnect(), []);

  if (announcementsIsError) return <ErrorPage message={announcementsError.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  const unreadAnnouncements = data.pages.flatMap((page) => page.announcements);
  // every page carries the total; the latest one is the freshest
  const totalCount = data.pages[data.pages.length - 1].totalCount;

  return (
    <ScrollablePageBlock title={`General Announcements (${totalCount})`}>
      {unreadAnnouncements.length === 0 ? (
        <NoGeneralAnnouncementsDisplay />
      ) : (
        <>
          {unreadAnnouncements.map((announcement) => (
            <GeneralAnnouncementCard
              key={announcement.announcementId}
              announcement={announcement}
              removeAnnouncement={removeAnnouncement}
              removeDisabled={removeAnnouncementIsLoading}
            />
          ))}
          {hasNextPage && (
            <Box ref={setSentinel} sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 1 }}>
              {isFetchingNextPage && <CircularProgress size={24} />}
            </Box>
          )}
        </>
      )}
    </ScrollablePageBlock>
  );
};

export default GeneralAnnouncements;
