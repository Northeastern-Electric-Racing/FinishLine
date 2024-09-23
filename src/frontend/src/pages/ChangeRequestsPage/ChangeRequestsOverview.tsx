/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { isLeadership, isHead } from 'shared';
import { useAllProjects } from '../../hooks/projects.hooks';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import ChangeRequestRow from '../../components/ChangeRequestRow';
import { getCRsApproved, getCRsToReview, getCRsUnreviewed } from '../../utils/change-request.utils';

const ChangeRequestsOverview: React.FC = () => {
  const user = useCurrentUser();

  const { data: changeRequests, isError: crIsError, isLoading: crIsLoading, error: crError } = useAllChangeRequests();
  const { data: projects, isError: projectIsError, isLoading: projectLoading, error: projectError } = useAllProjects();
  const { data: workPackages, isError: wpIsError, isLoading: wpLoading, error: wpError } = useAllWorkPackages();

  // whether to show To Review section
  const showToReview = isHead(user.role) || isLeadership(user.role);

  if (crIsLoading || projectLoading || wpLoading || !changeRequests || !projects || !workPackages)
    return <LoadingIndicator />;
  if (crIsError) return <ErrorPage message={crError?.message} />;
  if (projectIsError) return <ErrorPage message={projectError?.message} />;
  if (wpIsError) return <ErrorPage message={wpError?.message} />;

  const crToReview = getCRsToReview(projects, workPackages, user, changeRequests);
  const crUnreviewed = getCRsUnreviewed(user, changeRequests);
  const crApproved = getCRsApproved(user, changeRequests);

  return (
    <>
      {showToReview && (
        <ChangeRequestRow
          title="Change Requests To Review"
          changeRequests={crToReview}
          noChangeRequestsMessage="No change requests to review"
        />
      )}
      <ChangeRequestRow
        title="My Un-reviewed Change Requests"
        changeRequests={crUnreviewed}
        noChangeRequestsMessage="No un-reviewed change requests"
      />
      <ChangeRequestRow
        title="My Approved Change Requests"
        changeRequests={crApproved}
        noChangeRequestsMessage="No approved change requests"
      />
    </>
  );
};

export default ChangeRequestsOverview;
