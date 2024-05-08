import React from 'react';
import { ChangeRequest, StandardChangeRequest, WbsElement } from 'shared';
import CompareProposedChanges, { PotentialChange } from './CompareProposedChanges';
import { fullNamePipe } from '../../utils/pipes';

interface WbsComparisonBlockProps {
  changeRequest: ChangeRequest;
  isProject: boolean;
  isProposed: boolean;
  wbsElement?: WbsElement;
}

const WbsComparisonBlock: React.FC<WbsComparisonBlockProps> = ({ changeRequest, isProject, isProposed, wbsElement }) => {
  const initialName: PotentialChange = {
    field: 'Name',
    content: wbsElement ? `${wbsElement.name}` : ''
  };

  const proposedName: PotentialChange = {
    field: 'Name',
    content: `${
      isProject
        ? (changeRequest as StandardChangeRequest)?.projectProposedChanges?.name
        : (changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.name
    }`
  };

  const initialStatus: PotentialChange = {
    field: 'Status',
    content: wbsElement ? `${wbsElement.status}` : ''
  };

  const proposedStatus: PotentialChange = {
    field: 'Status',
    content: `${
      isProject
        ? (changeRequest as StandardChangeRequest)?.projectProposedChanges?.status
        : (changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.status
    }`
  };

  const initialLead: PotentialChange = {
    field: 'Lead',
    content: wbsElement ? `${fullNamePipe(wbsElement.lead)}` : ''
  };

  const proposedLead: PotentialChange = {
    field: 'Lead',
    content: `${
      (changeRequest as StandardChangeRequest)?.projectProposedChanges
        ? fullNamePipe((changeRequest as StandardChangeRequest)?.projectProposedChanges?.projectLead)
        : fullNamePipe((changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.projectLead)
    }`
  };

  const initialManager: PotentialChange = {
    field: 'Manager',
    content: wbsElement ? `${fullNamePipe(wbsElement.manager)}` : ''
  };

  const proposedManager: PotentialChange = {
    field: 'Manager',
    content: `${
      (changeRequest as StandardChangeRequest)?.projectProposedChanges
        ? fullNamePipe((changeRequest as StandardChangeRequest)?.projectProposedChanges?.projectManager)
        : fullNamePipe((changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.projectManager)
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
