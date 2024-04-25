import { ChangeRequest, StandardChangeRequest } from 'shared';
import CompareFields, { PotentialChange } from './CompareFields';
import { useSingleProject } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';

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
      <CompareFields first={initialProjectStatus} second={proposedProjectStatus} isProposed={isProposed} />
      <CompareFields first={initialProjectLead} second={proposedProjectLead} isProposed={isProposed} />
      <CompareFields first={initialProjectManager} second={proposedProjectManager} isProposed={isProposed} />
      <CompareFields first={initialBudget} second={proposedBudget} isProposed={isProposed} />
      <CompareFields first={initialSummary} second={proposedSummary} isProposed={isProposed} />
      <CompareFields first={initialGoals} second={proposedGoals} isProposed={isProposed} />
      <CompareFields first={initialFeatures} second={proposedFeatures} isProposed={isProposed} />
      <CompareFields first={initialConstraints} second={proposedConstraints} isProposed={isProposed} />
      <CompareFields first={initialTeams} second={proposedTeams} isProposed={isProposed} />
      <CompareFields first={initialRules} second={proposedRules} isProposed={isProposed} />
    </>
  );
};

export default ProjectComparisonBlock;
