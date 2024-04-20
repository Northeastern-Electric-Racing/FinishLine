import { ChangeRequest, StandardChangeRequest } from 'shared';
import CompareFields, { PotentialChange } from './CompareFields';

import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { datePipe } from '../../utils/pipes';

interface CompareProjectFieldsProps {
  changeRequest: ChangeRequest;
  isProposed: boolean;
}

/*Change Objects for every field to be compared*/
// WORK PACKAGE CHANGES

const WorkPackageComparisonBlock: React.FC<CompareProjectFieldsProps> = ({ changeRequest, isProposed }) => {
  const {
    data: workPackage,
    isLoading,
    isError,
    error
  } = useSingleWorkPackage({
    carNumber: changeRequest.wbsNum.carNumber,
    projectNumber: changeRequest.wbsNum.projectNumber,
    workPackageNumber: changeRequest.wbsNum.workPackageNumber
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (!workPackage || isLoading) return <LoadingIndicator />;

  const initialDuration: PotentialChange = {
    field: 'Duration',
    content: `${workPackage.duration} weeks`
  };

  const proposedDuration: PotentialChange = {
    field: 'Duration',
    content: `${(changeRequest as StandardChangeRequest).workPackageProposedChanges?.duration} weeks`
  };

  const initialStage: PotentialChange = {
    field: 'Stage',
    content: `${workPackage.stage}`
  };

  const proposedStage: PotentialChange = {
    field: 'Stage',
    content: `${(changeRequest as StandardChangeRequest).workPackageProposedChanges?.stage}`
  };

  const initialStartDate: PotentialChange = {
    field: 'Start Date',
    content: `${datePipe(workPackage.startDate)}`
  };

  const proposedStartDate: PotentialChange = {
    field: 'Start Date',
    content: datePipe((changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.startDate)
  };

  return (
    <>
      <CompareFields first={initialDuration} second={proposedDuration} isProposed={isProposed} />
      <CompareFields first={initialStage} second={proposedStage} isProposed={isProposed} />
      <CompareFields first={initialStartDate} second={proposedStartDate} isProposed={isProposed} />
    </>
  );
};

export default WorkPackageComparisonBlock;
