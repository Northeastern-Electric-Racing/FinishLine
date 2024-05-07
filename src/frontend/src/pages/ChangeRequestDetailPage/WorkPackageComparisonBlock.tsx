import { ChangeRequest, StandardChangeRequest } from 'shared';
import { PotentialChange } from './CompareProposedChanges';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { datePipe } from '../../utils/pipes';
import CompareProposedChanges from './CompareProposedChanges';
import WbsComparisonBlock from './WbsComparisonBlock';

interface CompareProjectFieldsProps {
  changeRequest: ChangeRequest;
  isProposed: boolean;
}

const WorkPackageComparisonBlock: React.FC<CompareProjectFieldsProps> = ({ changeRequest, isProposed }) => {
  const { data: workPackage, isLoading, isError, error } = useSingleWorkPackage(changeRequest.wbsNum);

  if (isError) return <ErrorPage message={error?.message} />;
  if (!workPackage || isLoading) return <LoadingIndicator />;

  const initialDuration: PotentialChange = {
    field: 'Duration',
    content: `${workPackage.duration} weeks`
  };

  const proposedDuration: PotentialChange = {
    field: 'Duration',
    content: `${(changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.duration} weeks`
  };

  const initialStage: PotentialChange = {
    field: 'Stage',
    content: `${workPackage.stage}`
  };

  const proposedStage: PotentialChange = {
    field: 'Stage',
    content: `${(changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.stage}`
  };

  const initialStartDate: PotentialChange = {
    field: 'Start Date',
    content: (workPackage?.startDate).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    })
  };

  const proposedStartDate: PotentialChange = {
    field: 'Start Date',
    content: ''
  };

  const initialDeliverables: PotentialChange = {
    field: 'Deliverables',
    content: workPackage.deliverables
  };

  const proposedDeliverables: PotentialChange = {
    field: 'Deliverables',
    content: (changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.deliverables || []
  };

  const initialExpectedActivities: PotentialChange = {
    field: 'Expected Activities',
    content: workPackage.expectedActivities
  };

  const proposedExpectedActivities: PotentialChange = {
    field: 'Expected Activities',
    content: (changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.expectedActivities || []
  };

  const initialBlockedBy: PotentialChange = {
    field: 'Blocked By',
    content: workPackage?.blockedBy
      .map(
        (wbs, index, array) =>
          wbs.carNumber.toString() +
          '.' +
          wbs.projectNumber.toString() +
          '.' +
          wbs.workPackageNumber.toString() +
          (index !== array.length - 1 ? ', ' : '')
      )
      .join('')
  };

  const proposedBlockedBy: PotentialChange = {
    field: 'Blocked By',
    content: ((changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.blockedBy || [])
      .map(
        (wbs, index, array) =>
          wbs.carNumber.toString() +
          '.' +
          wbs.projectNumber.toString() +
          '.' +
          wbs.workPackageNumber.toString() +
          (index !== array.length - 1 ? ', ' : '')
      )
      .join('')
  };

  return (
    <>
      <WbsComparisonBlock changeRequest={changeRequest} isProject={false} isProposed={isProposed} wbsElement={workPackage} />
      <CompareProposedChanges first={initialDuration} second={proposedDuration} isProposed={isProposed} />
      <CompareProposedChanges first={initialStage} second={proposedStage} isProposed={isProposed} />
      <CompareProposedChanges first={initialStartDate} second={proposedStartDate} isProposed={isProposed} />
      <CompareProposedChanges first={initialDeliverables} second={proposedDeliverables} isProposed={isProposed} />
      <CompareProposedChanges
        first={initialExpectedActivities}
        second={proposedExpectedActivities}
        isProposed={isProposed}
      />
      <CompareProposedChanges first={initialBlockedBy} second={proposedBlockedBy} isProposed={isProposed} />
    </>
  );
};

export default WorkPackageComparisonBlock;
