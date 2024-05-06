import React from 'react';
import { ChangeRequest, StandardChangeRequest, WbsElement } from 'shared';
import CompareProposedChanges, { PotentialChange } from './CompareProposedChanges';
import { fullNamePipe } from '../../utils/pipes';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useSingleProject } from '../../hooks/projects.hooks';
import { useSingleWorkPackage } from '../../hooks/work-packages.hooks';

interface WbsComparisonBlockProps {
  changeRequest: ChangeRequest;
  isProject: boolean;
  isProposed: boolean;
}

const WbsComparisonBlock: React.FC<WbsComparisonBlockProps> = ({ changeRequest, isProject, isProposed }) => {
  const { data: wbsElement, isLoading, isError, error } = useSingleProject(changeRequest.wbsNum);
  // if u change the hook to useSingleWorkPackage and click on a cr with projects, itll keep loading and then return error

  if (isError) return <ErrorPage message={error?.message} />;
  if (!wbsElement || isLoading) return <LoadingIndicator />;

  const initialName: PotentialChange = {
    field: 'Name',
    content: `${(wbsElement as WbsElement).name}`
  };

  const proposedName: PotentialChange = {
    field: 'Name',
    content: `${
      isProject
        ? (changeRequest as StandardChangeRequest).projectProposedChanges?.name
        : (changeRequest as StandardChangeRequest).workPackageProposedChanges?.name
    }`
  };

  const initialStatus: PotentialChange = {
    field: 'Status',
    content: `${(wbsElement as WbsElement).status}`
  };

  const proposedStatus: PotentialChange = {
    field: 'Status',
    content: `${
      isProject
        ? (changeRequest as StandardChangeRequest).projectProposedChanges?.status
        : (changeRequest as StandardChangeRequest).workPackageProposedChanges?.status
    }`
  };

  const initialLead: PotentialChange = {
    field: 'Lead',
    content: `${fullNamePipe((wbsElement as WbsElement).projectLead)}`
  };

  const proposedLead: PotentialChange = {
    field: 'Lead',
    content: `${
      isProject
        ? fullNamePipe((changeRequest as StandardChangeRequest).projectProposedChanges?.projectLead)
        : fullNamePipe((changeRequest as StandardChangeRequest).workPackageProposedChanges?.projectLead)
    }`
  };

  const initialManager: PotentialChange = {
    field: 'Manager',
    content: `${fullNamePipe((wbsElement as WbsElement).projectManager)}`
  };

  const proposedManager: PotentialChange = {
    field: 'Manager',
    content: `${
      isProject
        ? fullNamePipe((changeRequest as StandardChangeRequest).projectProposedChanges?.projectManager)
        : fullNamePipe((changeRequest as StandardChangeRequest).workPackageProposedChanges?.projectManager)
    }`
  };

  return (
    <>
      <CompareProposedChanges first={initialName} second={proposedName} isProposed={isProposed} />
      <CompareProposedChanges first={initialStatus} second={proposedStatus} isProposed={isProposed} />
      <CompareProposedChanges first={initialLead} second={proposedLead} isProposed={isProposed} />
      <CompareProposedChanges first={initialManager} second={proposedManager} isProposed={isProposed} />
    </>
  );
};

export default WbsComparisonBlock;
