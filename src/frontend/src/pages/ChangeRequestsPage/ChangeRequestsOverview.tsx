/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { isLeadership, isHead } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import ChangeRequestRow from '../../components/ChangeRequestRow';
import {
  useGetApprovedChangeRequests,
  useGetToReviewChangeRequests,
  useGetUnreviewedChangeRequests
} from '../../hooks/change-requests.hooks';

const ChangeRequestsOverview: React.FC = () => {
  const user = useCurrentUser();

  const {
    data: toReviewChangeRequests,
    isError: toReviewIsError,
    isLoading: toReviewIsLoading,
    error: toReviewError
  } = useGetToReviewChangeRequests();
  const {
    data: unreviewedChangeRequests,
    isError: unreviewedIsError,
    isLoading: unreviewedIsLoading,
    error: unreviewedError
  } = useGetUnreviewedChangeRequests();
  const {
    data: approvedChangeRequests,
    isError: approvedIsError,
    isLoading: approvedIsLoading,
    error: approvedError
  } = useGetApprovedChangeRequests();

  // whether to show To Review section
  const showToReview = isHead(user.role) || isLeadership(user.role);

  if (toReviewIsError) return <ErrorPage message={toReviewError?.message} />;
  if (unreviewedIsError) return <ErrorPage message={unreviewedError?.message} />;
  if (approvedIsError) return <ErrorPage message={approvedError?.message} />;

  if (
    toReviewIsLoading ||
    unreviewedIsLoading ||
    approvedIsLoading ||
    !unreviewedChangeRequests ||
    !approvedChangeRequests ||
    !toReviewChangeRequests
  )
    return <LoadingIndicator />;

  return (
    <>
      {showToReview && (
        <ChangeRequestRow
          title="Change Requests To Review"
          changeRequests={toReviewChangeRequests}
          noChangeRequestsMessage="No change requests to review"
        />
      )}
      <ChangeRequestRow
        title="My Un-reviewed Change Requests"
        changeRequests={unreviewedChangeRequests}
        noChangeRequestsMessage="No un-reviewed change requests"
      />
      <ChangeRequestRow
        title="My Approved Change Requests"
        changeRequests={approvedChangeRequests}
        noChangeRequestsMessage="No approved change requests"
      />
    </>
  );
};

export default ChangeRequestsOverview;
