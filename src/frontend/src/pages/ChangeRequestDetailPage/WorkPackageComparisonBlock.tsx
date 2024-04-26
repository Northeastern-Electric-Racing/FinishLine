import { ChangeRequest, StandardChangeRequest } from 'shared';
import { PotentialChange } from './CompareProposedChanges';

import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { datePipe } from '../../utils/pipes';
import CompareProposedChanges from './CompareProposedChanges';

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

  const initialName: PotentialChange = {
    field: 'Name',
    content: `${workPackage.name}`
  };

  const proposedName: PotentialChange = {
    field: 'Name',
    content: `${(changeRequest as StandardChangeRequest).workPackageProposedChanges?.name}`
  };

  const initialProjectStatus: PotentialChange = {
    field: 'Status',
    content: `${workPackage.status}`
  };

  const proposedProjectStatus: PotentialChange = {
    field: 'Status',
    content: `${(changeRequest as StandardChangeRequest).workPackageProposedChanges?.status}`
  };

  const initialProjectLead: PotentialChange = {
    field: 'Project Lead',
    content: `${workPackage.projectLead?.firstName} ${workPackage.projectLead?.lastName}`
  };

  const proposedProjectLead: PotentialChange = {
    field: 'Project Lead',
    content: `${(changeRequest as StandardChangeRequest).workPackageProposedChanges?.projectLead?.firstName} ${
      (changeRequest as StandardChangeRequest).workPackageProposedChanges?.projectLead?.lastName
    }`
  };

  const initialProjectManager: PotentialChange = {
    field: 'Project Manager',
    content: `${workPackage.projectManager?.firstName} ${workPackage.projectManager?.lastName}`
  };

  const proposedProjectManager: PotentialChange = {
    field: 'Project Manager',
    content: `${(changeRequest as StandardChangeRequest).workPackageProposedChanges?.projectManager?.firstName} ${
      (changeRequest as StandardChangeRequest).workPackageProposedChanges?.projectManager?.lastName
    }`
  };

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
      <CompareProposedChanges first={initialName} second={proposedName} isProposed={isProposed} />
      <CompareProposedChanges first={initialProjectStatus} second={proposedProjectStatus} isProposed={isProposed} />
      <CompareProposedChanges first={initialProjectLead} second={proposedProjectLead} isProposed={isProposed} />
      <CompareProposedChanges first={initialProjectManager} second={proposedProjectManager} isProposed={isProposed} />
      <CompareProposedChanges first={initialDuration} second={proposedDuration} isProposed={isProposed} />
      <CompareProposedChanges first={initialStage} second={proposedStage} isProposed={isProposed} />
      <CompareProposedChanges first={initialStartDate} second={proposedStartDate} isProposed={isProposed} />
    </>
  );
};

export default WorkPackageComparisonBlock;
