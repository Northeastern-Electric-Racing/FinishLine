/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest, changeRequests, Project, equalsWbsNumber } from 'shared';
import { useAllChangeRequests } from '../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import CRRow from '../../../components/ChangeRequestRow';

const ChangeRequestTab = ({ project }: { project: Project }) => {
  const { data: changeRequests, isError: crIsError, isLoading: crIsLoading, error: crError } = useAllChangeRequests();
  if (crIsLoading || !changeRequests) return <LoadingIndicator />;
  if (crIsError) return <ErrorPage message={crError?.message} />;

  const wbsNum = project.wbsNum;

  const unReviewedChangeRequests = changeRequests
    .filter((cr: ChangeRequest) => !cr.dateReviewed && equalsWbsNumber(wbsNum, cr.wbsNum))
    .sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());

  const approvedChangeRequests = changeRequests
    .filter((cr: ChangeRequest) => cr.accepted && equalsWbsNumber(wbsNum, cr.wbsNum))
    .sort((a, b) => (a.dateReviewed && b.dateReviewed ? b.dateReviewed.getTime() - a.dateReviewed.getTime() : 0));

  const crUnreviewedRow: changeRequests = {
    title: 'Un-reviewed Change Requests',
    crList: unReviewedChangeRequests,
    noChangeRequestsMessage: 'No un-reviewed change requests'
  };

  const crApprovedRow: changeRequests = {
    title: 'Approved Change Requests',
    crList: approvedChangeRequests,
    noChangeRequestsMessage: 'No recently approved change requests'
  };

  return <CRRow crRowList={[crUnreviewedRow, crApprovedRow]} />;
};
export default ChangeRequestTab;
