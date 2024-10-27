import { useAllWorkPackages } from '../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useAllChangeRequests } from '../../../hooks/change-requests.hooks';
import { useAllProjects } from '../../../hooks/projects.hooks';
import { getCRsToReview } from '../../../utils/change-request.utils';
import ChangeRequestRow from '../../../components/ChangeRequestRow';
import ScrollablePageBlock from './ScrollablePageBlock';

const UnreviewedChangeRequests: React.FC = () => {
  const user = useCurrentUser();
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
    <ScrollablePageBlock>
      <ChangeRequestRow
        title={`My Unreviewed Change Requests (${crsToReview.length})`}
        changeRequests={crsToReview}
        noChangeRequestsMessage="No unreviewed change requests"
        flexWrap="nowrap"
      />
    </ScrollablePageBlock>
  );
};

export default UnreviewedChangeRequests;
