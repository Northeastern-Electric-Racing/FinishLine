import { useAllWorkPackages } from '../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useAllChangeRequests } from '../../../hooks/change-requests.hooks';
import { useAllProjects } from '../../../hooks/projects.hooks';
import { getCRsToReview } from '../../../utils/change-request.utils';
import ScrollablePageBlock from './ScrollablePageBlock';
import { AuthenticatedUser, ChangeRequest } from 'shared';
import ChangeRequestDetailCard from '../../../components/ChangeRequestDetailCard';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

interface ChangeRequestsToReviewProps {
  user: AuthenticatedUser;
}

const NoChangeRequestsToReview: React.FC = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 70 }} />}
      heading={`You're all caught up!`}
      message={'You have no unreviewed change requests!'}
    />
  );
};

const ChangeRequestsToReview: React.FC<ChangeRequestsToReviewProps> = ({ user }) => {
  const { data: changeRequests, isError: crIsError, isLoading: crIsLoading, error: crError } = useAllChangeRequests();
  const { data: projects, isError: projectIsError, isLoading: projectLoading, error: projectError } = useAllProjects();
  const { data: workPackages, isError: wpIsError, isLoading: wpLoading, error: wpError } = useAllWorkPackages();

  if (crIsLoading || projectLoading || wpLoading || !changeRequests || !projects || !workPackages)
    return <LoadingIndicator />;
  if (crIsError) return <ErrorPage message={crError.message} />;
  if (projectIsError) return <ErrorPage message={projectError.message} />;
  if (wpIsError) return <ErrorPage message={wpError.message} />;

  const crsToReview = getCRsToReview(projects, workPackages, user, changeRequests);

  return (
    <ScrollablePageBlock title={`Change Requests To Review (${crsToReview.length})`} horizontal>
      {crsToReview.length === 0 ? (
        <NoChangeRequestsToReview />
      ) : (
        crsToReview.map((cr: ChangeRequest) => <ChangeRequestDetailCard changeRequest={cr} />)
      )}
    </ScrollablePageBlock>
  );
};

export default ChangeRequestsToReview;
