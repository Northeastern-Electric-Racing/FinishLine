import { ChangeRequest, StandardChangeRequest } from 'shared';
import { PotentialChange } from './CompareProposedChanges';
import { useSingleProject } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import CompareProposedChanges from './CompareProposedChanges';

interface CompareProjectFieldsProps {
  changeRequest: ChangeRequest;
  isProposed: boolean;
}

/*Change Objects for every field to be compared*/
// PROJECT CHANGES

const ProjectComparisonBlock: React.FC<CompareProjectFieldsProps> = ({ changeRequest, isProposed }) => {
  const {
    data: project,
    isLoading,
    isError,
    error
  } = useSingleProject({
    carNumber: changeRequest.wbsNum.carNumber,
    projectNumber: changeRequest.wbsNum.projectNumber,
    workPackageNumber: 0
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (!project || isLoading) return <LoadingIndicator />;

  const initialName: PotentialChange = {
    field: 'Name',
    content: `${project.name}`
  };

  const proposedName: PotentialChange = {
    field: 'Name',
    content: `${(changeRequest as StandardChangeRequest).projectProposedChanges?.name}`
  };

  const initialProjectStatus: PotentialChange = {
    field: 'Status',
    content: `${project.status}`
  };

  const proposedProjectStatus: PotentialChange = {
    field: 'Status',
    content: `${(changeRequest as StandardChangeRequest).projectProposedChanges?.status}`
  };

  const initialProjectLead: PotentialChange = {
    field: 'Project Lead',
    content: `${project.projectLead?.firstName} ${project.projectLead?.lastName}`
  };

  const proposedProjectLead: PotentialChange = {
    field: 'Project Lead',
    content: `${(changeRequest as StandardChangeRequest).projectProposedChanges?.projectLead?.firstName} ${
      (changeRequest as StandardChangeRequest).projectProposedChanges?.projectLead?.lastName
    }`
  };

  const initialProjectManager: PotentialChange = {
    field: 'Project Manager',
    content: `${project.projectManager?.firstName} ${project.projectManager?.lastName}`
  };

  const proposedProjectManager: PotentialChange = {
    field: 'Project Manager',
    content: `${(changeRequest as StandardChangeRequest).projectProposedChanges?.projectManager?.firstName} ${
      (changeRequest as StandardChangeRequest).projectProposedChanges?.projectManager?.lastName
    }`
  };

  const initialBudget: PotentialChange = {
    field: 'Budget',
    content: `$${project.budget}`
  };

  const proposedBudget: PotentialChange = {
    field: 'Budget',
    content: `$${(changeRequest as StandardChangeRequest).projectProposedChanges?.budget}`
  };

  const initialSummary: PotentialChange = {
    field: 'Summary',
    content: `${project.summary}`
  };

  const proposedSummary: PotentialChange = {
    field: 'Summary',
    content: `${(changeRequest as StandardChangeRequest).projectProposedChanges?.summary}`
  };

  const initialGoals: PotentialChange = {
    field: 'Goals',
    content: project.goals
  };

  const proposedGoals: PotentialChange = {
    field: 'Goals',
    content: (changeRequest as StandardChangeRequest)?.projectProposedChanges?.goals || []
  };

  const initialFeatures: PotentialChange = {
    field: 'Features',
    content: project.features
  };

  const proposedFeatures: PotentialChange = {
    field: 'Features',
    content: (changeRequest as StandardChangeRequest)?.projectProposedChanges?.features || []
  };

  const initialConstraints: PotentialChange = {
    field: 'Constraints',
    content: project.otherConstraints
  };

  const proposedConstraints: PotentialChange = {
    field: 'Constraints',
    content: (changeRequest as StandardChangeRequest)?.projectProposedChanges?.otherConstrains || []
  };

  const initialTeams: PotentialChange = {
    field: 'Teams',
    content: (project?.teams || [])
      .map((team, index, array) => team.teamName + (index !== array.length - 1 ? ', ' : ''))
      .join('')
  };

  const proposedTeams: PotentialChange = {
    field: 'Teams',
    content: ((changeRequest as StandardChangeRequest)?.projectProposedChanges?.teams || [])
      .map((team, index, array) => team.teamName + (index !== array.length - 1 ? ', ' : ''))
      .join('')
  };

  const initialRules: PotentialChange = {
    field: 'Rules',
    content: (project?.rules || []).map((rule, index, array) => rule + (index !== array.length - 1 ? ', ' : '')).join('')
  };

  const proposedRules: PotentialChange = {
    field: 'Rules',
    content: ((changeRequest as StandardChangeRequest)?.projectProposedChanges?.rules || [])
      .map((rule, index, array) => rule + (index !== array.length - 1 ? ', ' : ''))
      .join('')
  };

  return (
    <>
      <CompareProposedChanges first={initialName} second={proposedName} isProposed={isProposed} />
      <CompareProposedChanges first={initialProjectStatus} second={proposedProjectStatus} isProposed={isProposed} />
      <CompareProposedChanges first={initialProjectLead} second={proposedProjectLead} isProposed={isProposed} />
      <CompareProposedChanges first={initialProjectManager} second={proposedProjectManager} isProposed={isProposed} />
      <CompareProposedChanges first={initialBudget} second={proposedBudget} isProposed={isProposed} />
      <CompareProposedChanges first={initialSummary} second={proposedSummary} isProposed={isProposed} />
      <CompareProposedChanges first={initialGoals} second={proposedGoals} isProposed={isProposed} />
      <CompareProposedChanges first={initialFeatures} second={proposedFeatures} isProposed={isProposed} />
      <CompareProposedChanges first={initialConstraints} second={proposedConstraints} isProposed={isProposed} />
      <CompareProposedChanges first={initialTeams} second={proposedTeams} isProposed={isProposed} />
      <CompareProposedChanges first={initialRules} second={proposedRules} isProposed={isProposed} />
    </>
  );
};

export default ProjectComparisonBlock;
