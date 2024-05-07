import { ChangeRequest, StandardChangeRequest } from 'shared';
import { PotentialChange } from './CompareProposedChanges';
import { useSingleProject } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import CompareProposedChanges from './CompareProposedChanges';
import WbsComparisonBlock from './WbsComparisonBlock';

interface CompareProjectFieldsProps {
  changeRequest: ChangeRequest;
  isProposed: boolean;
}

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

  const initialBudget: PotentialChange = {
    field: 'Budget',
    content: `$${project.budget}`
  };

  // a project's proposed changes

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
    content: project?.teams.map((team, index, array) => team.teamName + (index !== array.length - 1 ? ', ' : '')).join('')
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

  // a project's proposed work package changes
  const proposedDuration: PotentialChange = {
    field: 'Duration',
    content: `${(changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.duration} weeks`
  };

  const proposedStage: PotentialChange = {
    field: 'Stage',
    content: `${(changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.stage}`
  };

  const proposedStartDate: PotentialChange = {
    field: 'Start Date',
    content: ''
  };

  const proposedDeliverables: PotentialChange = {
    field: 'Deliverables',
    content: (changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.deliverables || []
  };

  const proposedExpectedActivities: PotentialChange = {
    field: 'Expected Activities',
    content: (changeRequest as StandardChangeRequest)?.workPackageProposedChanges?.expectedActivities || []
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

  return (changeRequest as StandardChangeRequest)?.workPackageProposedChanges ? (
    <>
      <WbsComparisonBlock changeRequest={changeRequest} isProject={true} isProposed={true} wbsElement={project} />
      <CompareProposedChanges first={initialBudget} second={proposedDuration} isProposed={true} />
      <CompareProposedChanges first={initialSummary} second={proposedStage} isProposed={true} />
      <CompareProposedChanges first={initialGoals} second={proposedStartDate} isProposed={true} />
      <CompareProposedChanges first={initialFeatures} second={proposedDeliverables} isProposed={true} />
      <CompareProposedChanges first={initialConstraints} second={proposedExpectedActivities} isProposed={true} />
      <CompareProposedChanges first={initialTeams} second={proposedBlockedBy} isProposed={true} />
    </>
  ) : (
    <>
      <WbsComparisonBlock changeRequest={changeRequest} isProject={true} isProposed={isProposed} wbsElement={project} />
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
