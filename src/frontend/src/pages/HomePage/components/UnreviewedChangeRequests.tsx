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
import { Box } from '@mui/material';

interface UnreviewedChangeRequestsProps {
  user: AuthenticatedUser;
}

const NoUnreviewedChangeRequests: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <EmptyPageBlockDisplay
        icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 70 }} />}
        heading={`You're all caught up!`}
        message={'Uou have no unreviewed changre requests!'}
      />
    </Box>
  );
};

const UnreviewedChangeRequests: React.FC<UnreviewedChangeRequestsProps> = ({ user }) => {
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
    <ScrollablePageBlock title={`My Unreviewed Change Requests (${crsToReview.length})`} horizontal>
      {crsToReview.length === 0 ? (
        <NoUnreviewedChangeRequests />
      ) : (
        crsToReview.map((cr: ChangeRequest) => <ChangeRequestDetailCard changeRequest={cr}></ChangeRequestDetailCard>)
      )}
    </ScrollablePageBlock>
  );
};

export default UnreviewedChangeRequests;
