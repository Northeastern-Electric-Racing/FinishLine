import { ChangeRequest, WorkPackage } from 'shared';
import { useAllChangeRequests } from '../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { projectWbsPipe } from '../../../utils/pipes';
import ChangeRequestRow from '../../../components/ChangeRequestRow';

interface ChangeRequestsTabProps {
  workPackage: WorkPackage;
}

const ChangeRequestsTab: React.FC<ChangeRequestsTabProps> = ({ workPackage }) => {
  const { data: changeRequests, isError: crIsError, isLoading: crIsLoading, error: crError } = useAllChangeRequests();

  if (crIsLoading || !changeRequests) return <LoadingIndicator />;
  if (crIsError) return <ErrorPage message={crError?.message} />;

  const unReviewedChangeRequests = changeRequests
    .filter((cr: ChangeRequest) => !cr.dateReviewed && projectWbsPipe(cr.wbsNum) === projectWbsPipe(workPackage.wbsNum))
    .sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());

  const approvedChangeRequests = changeRequests
    .filter((cr: ChangeRequest) => cr.accepted && projectWbsPipe(cr.wbsNum) === projectWbsPipe(workPackage.wbsNum))
    .sort((a, b) => (a.dateReviewed && b.dateReviewed ? b.dateReviewed.getTime() - a.dateReviewed.getTime() : 0));

  return (
    <>
      <ChangeRequestRow
        title="Un-reviewed Change Requests"
        changeRequests={unReviewedChangeRequests}
        noChangeRequestsMessage="No un-reviewed change requests"
      />

      <ChangeRequestRow
        title="Reviewed Change Requests"
        changeRequests={approvedChangeRequests}
        noChangeRequestsMessage="No Approved change requests"
      />
    </>
  );
};
export default ChangeRequestsTab;
