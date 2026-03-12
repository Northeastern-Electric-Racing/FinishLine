import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useGetToReviewChangeRequests } from '../../../hooks/change-requests.hooks';
import ScrollablePageBlock from './ScrollablePageBlock';
import { ChangeRequestTableRow } from 'shared';
import ChangeRequestDetailCard from '../../../components/ChangeRequestDetailCard';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

interface ChangeRequestsToReviewProps {}

const NoChangeRequestsToReview: React.FC = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 70 }} />}
      heading={`You're all caught up!`}
      message={'You have no unreviewed change requests!'}
    />
  );
};

const ChangeRequestsToReview: React.FC<ChangeRequestsToReviewProps> = () => {
  const {
    data: changeRequests,
    isError: crIsError,
    isLoading: crIsLoading,
    error: crError
  } = useGetToReviewChangeRequests();

  if (crIsError) return <ErrorPage message={crError.message} />;

  if (crIsLoading || !changeRequests) return <LoadingIndicator />;

  return (
    <ScrollablePageBlock title={`Change Requests To Review (${changeRequests.length})`} horizontal>
      {changeRequests.length === 0 ? (
        <NoChangeRequestsToReview />
      ) : (
        changeRequests.map((cr: ChangeRequestTableRow) => <ChangeRequestDetailCard changeRequest={cr} />)
      )}
    </ScrollablePageBlock>
  );
};

export default ChangeRequestsToReview;
