import { useAllWorkPackages } from '../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useAllChangeRequests } from '../../../hooks/change-requests.hooks';
import { useAllProjects } from '../../../hooks/projects.hooks';
import { getCRsToReview } from '../../../utils/change-request.utils';
import Box from '@mui/material/Box';
import ChangeRequestRow from '../../../components/ChangeRequestRow';

const UnreviewedChangeRequests: React.FC = () => {
  const user = useCurrentUser();
  const { data: changeRequests, isError: crIsError, isLoading: crIsLoading, error: crError } = useAllChangeRequests();
  const { data: projects, isError: projectIsError, isLoading: projectLoading, error: projectError } = useAllProjects();
  const { data: workPackages, isError: wpIsError, isLoading: wpLoading, error: wpError } = useAllWorkPackages();

  if (crIsLoading || projectLoading || wpLoading || !changeRequests || !projects || !workPackages)
    return <LoadingIndicator />;
  if (crIsError) return <ErrorPage message={crError?.message} />;
  if (projectIsError) return <ErrorPage message={projectError?.message} />;
  if (wpIsError) return <ErrorPage message={wpError?.message} />;

  const crsToReview = getCRsToReview(projects, workPackages, user, changeRequests);

  return (
    <PageBlock>
      <Box sx={{ flexWrap: 'nowrap' }}>
        <ChangeRequestRow
          title="My Unreviewed Change Requests"
          changeRequests={crsToReview}
          noChangeRequestsMessage="No unreviewed change requests"
        />
        <style>{`
          [data-testid='My Unreviewed Change RequestscrRow'] {
            flex-wrap: nowrap !important;
          }
        `}</style>
      </Box>
    </PageBlock>
  );
};

export default UnreviewedChangeRequests;
