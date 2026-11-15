import { useCallback, useRef } from 'react';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import ScrollablePageBlock from './ScrollablePageBlock';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import GeneralAnnouncementCard from './GeneralAnnouncementCard';
import { useRemoveUserAnnouncement, useUserAnnouncements } from '../../../hooks/announcements.hooks';
import ErrorPage from '../../ErrorPage';
import { useToast } from '../../../hooks/toasts.hooks';

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
  const toast = useToast();

  const handleRemove = async (announcementId: string) => {
    try {
      await removeAnnouncement(announcementId);
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  // the sentinel below the last card loads the next page once it's in view. It's keyed on the page count, so each
  // loaded page remounts it with a new observer, whose first callback checks whether it's still in view. Unmounting
  // calls the ref with null, which disconnects the observer
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

  // a failed later page keeps the loaded announcements and shows a retry below them instead
  if (announcementsIsError && !data) return <ErrorPage message={announcementsError.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  const unreadAnnouncements = data.pages.flatMap((page) => page.announcements);
  // every page carries the total; the latest one is the freshest
  const { totalCount } = data.pages[data.pages.length - 1];

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
              removeAnnouncement={handleRemove}
              removeDisabled={removeAnnouncementIsLoading}
            />
          ))}
          {announcementsIsError ? (
            <Alert
              severity="error"
              sx={{ width: '100%' }}
              action={
                <Button color="inherit" size="small" onClick={() => fetchNextPage()}>
                  Retry
                </Button>
              }
            >
              {announcementsError.message}
            </Alert>
          ) : (
            hasNextPage && (
              <Box
                key={data.pages.length}
                ref={setSentinel}
                sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 1 }}
              >
                {isFetchingNextPage && <CircularProgress size={24} />}
              </Box>
            )
          )}
        </>
      )}
    </ScrollablePageBlock>
  );
};

export default GeneralAnnouncements;
