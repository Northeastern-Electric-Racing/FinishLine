/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequestType, WbsElement } from 'shared';
import { useGetApprovedChangeRequests, useGetUnreviewedChangeRequests } from '../hooks/change-requests.hooks';
import ErrorPage from '../pages/ErrorPage';
import LoadingIndicator from './LoadingIndicator';
import ChangeRequestRow from './ChangeRequestRow';

const ChangeRequestTab = ({ wbsElement }: { wbsElement: WbsElement }) => {
  const {
    data: unreviewedChangeRequests,
    isError: unreviewedCRIsError,
    isLoading: unreviewedCRIsLoading,
    error: unreviewedCRError
  } = useGetUnreviewedChangeRequests(wbsElement.wbsNum);
  const {
    data: approvedChangeRequests,
    isError: approvedCRIsError,
    isLoading: approvedCRIsLoading,
    error: approvedCRError
  } = useGetApprovedChangeRequests(wbsElement.wbsNum);

  if (unreviewedCRIsError) return <ErrorPage message={unreviewedCRError?.message} />;
  if (approvedCRIsError) return <ErrorPage message={approvedCRError?.message} />;

  if (unreviewedCRIsLoading || !unreviewedChangeRequests || approvedCRIsLoading || !approvedChangeRequests)
    return <LoadingIndicator />;

  // auto-approved non-meaningful CRs would flood this list; they're still in the change requests table
  const visibleApprovedChangeRequests = approvedChangeRequests.filter((cr) => cr.type !== ChangeRequestType.NonMeaningful);

  return (
    <>
      <ChangeRequestRow
        title="Un-reviewed Change Requests"
        changeRequests={unreviewedChangeRequests}
        noChangeRequestsMessage="No un-reviewed change requests"
      />
      <ChangeRequestRow
        title="Approved Change Requests"
        changeRequests={visibleApprovedChangeRequests}
        noChangeRequestsMessage="No recently approved change requests"
      />
    </>
  );
};
export default ChangeRequestTab;
