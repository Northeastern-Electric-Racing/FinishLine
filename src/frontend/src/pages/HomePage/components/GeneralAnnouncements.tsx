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
    data: unreadAnnouncements,
    isLoading,
    isError: announcementsIsError,
    error: announcementsError
  } = useUserAnnouncements();
  const { mutateAsync: removeAnnouncement, isLoading: removeAnnouncementIsLoading } = useRemoveUserAnnouncement();

  if (announcementsIsError) return <ErrorPage message={announcementsError.message} />;
  if (isLoading || removeAnnouncementIsLoading || !unreadAnnouncements) return <LoadingIndicator />;

  return (
    <ScrollablePageBlock title={`General Announcements (${unreadAnnouncements.length})`}>
      {unreadAnnouncements.length === 0 ? (
        <NoGeneralAnnouncementsDisplay />
      ) : (
        unreadAnnouncements.map((announcement) => (
          <GeneralAnnouncementCard announcement={announcement} removeAnnouncement={removeAnnouncement} />
        ))
      )}
    </ScrollablePageBlock>
  );
};

export default GeneralAnnouncements;
