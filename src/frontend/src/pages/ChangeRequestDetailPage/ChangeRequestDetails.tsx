/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useParams } from 'react-router-dom';
import { useSingleChangeRequest } from '../../hooks/change-requests.hooks';
import { useAuth } from '../../hooks/auth.hooks';
import ChangeRequestDetailsView from './ChangeRequestDetailsView';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { ChangeRequestStatus, isAdmin, isGuest, isHead, isNotLeadership } from 'shared';

const ChangeRequestDetails: React.FC = () => {
  interface ParamTypes {
    id: string;
  }
  const { id } = useParams<ParamTypes>();
  const { isLoading, isError, data, error } = useSingleChangeRequest(id);
  const auth = useAuth();

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  // Determine if user can review and why they can't
  const isLeadership = !isNotLeadership(auth.user?.role);
  const isSubmitter = auth.user?.userId === data?.submitter.userId;
  const isOpen = data!.status === ChangeRequestStatus.Open;
  const hasRequestedReviewers = data!.requestedReviewers.length > 0;
  const isInRequestedReviewers = data!.requestedReviewers.some((reviewer) => reviewer.userId === auth.user?.userId);

  const isUserAllowedToReview =
    !isSubmitter &&
    isOpen &&
    (isHead(auth.user?.role) || (isLeadership && (!hasRequestedReviewers || isInRequestedReviewers)));

  // Generate tooltip message explaining why review is disabled
  let reviewDisabledTooltip: string | undefined;
  if (!isUserAllowedToReview) {
    if (!isLeadership) {
      reviewDisabledTooltip = 'You must be a leadership member to review change requests';
    } else if (isSubmitter) {
      reviewDisabledTooltip = 'You cannot review your own change request';
    } else if (!isOpen) {
      reviewDisabledTooltip = 'This change request is not open for review';
    } else if (hasRequestedReviewers && !isInRequestedReviewers) {
      reviewDisabledTooltip = 'Only requested reviewers or heads/admins can review this change request';
    }
  }

  return (
    <ChangeRequestDetailsView
      isUserAllowedToReview={isUserAllowedToReview}
      reviewDisabledTooltip={reviewDisabledTooltip}
      isUserAllowedToImplement={!isGuest(auth.user?.role)}
      isUserAllowedToDelete={
        isAdmin(auth.user?.role) ||
        (auth.user?.userId === data?.submitter.userId && !data?.dateReviewed && data?.implementedChanges?.length === 0)
      }
      changeRequest={data!}
    />
  );
};

export default ChangeRequestDetails;
