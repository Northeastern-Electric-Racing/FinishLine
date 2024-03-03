/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest, ChangeRequestRow, Project, equalsWbsNumber } from 'shared';
import { useAllChangeRequests } from '../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import CRRow from '../../../components/ChangeRequestRow';

const CRTab = ({ project }: { project: Project }) => {
  const { data: changeRequests, isError: crIsError, isLoading: crIsLoading, error: crError } = useAllChangeRequests();
  if (crIsLoading || !changeRequests) return <LoadingIndicator />;
  if (crIsError) return <ErrorPage message={crError?.message} />;

  const wbsNum = project.wbsNum;
  const currentDate = new Date();

  const crUnreviewed = changeRequests
    .filter((cr: ChangeRequest) => !cr.dateReviewed && equalsWbsNumber(wbsNum, cr.wbsNum))
    .sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());

  const crApproved = changeRequests
    .filter(
      (cr: ChangeRequest) =>
        cr.dateReviewed &&
        cr.accepted &&
        equalsWbsNumber(wbsNum, cr.wbsNum) &&
        currentDate.getTime() - cr.dateReviewed.getTime() <= 1000 * 60 * 60 * 24 * 5
    )
    .sort((a, b) => (a.dateReviewed && b.dateReviewed ? b.dateReviewed.getTime() - a.dateReviewed.getTime() : 0));

  const crUnreviewedRow: ChangeRequestRow = {
    title: 'Un-reviewed Change Requests',
    crList: crUnreviewed,
    emptyMessage: 'No un-reviewed change requests'
  };

  const crApprovedRow: ChangeRequestRow = {
    title: 'Recently Approved Change Requests',
    crList: crApproved,
    emptyMessage: 'No recently approved change requests'
  };

  const tabRowList = [crUnreviewedRow, crApprovedRow];

  return <CRRow crRowList={tabRowList} />;
};
export default CRTab;
