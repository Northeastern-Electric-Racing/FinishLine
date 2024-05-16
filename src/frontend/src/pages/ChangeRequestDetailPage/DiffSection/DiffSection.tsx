import { Box } from '@mui/system';
import InfoBlock from '../../../components/InfoBlock';
import { ProjectProposedChangesPreview, StandardChangeRequest, WorkPackageProposedChangesPreview, isProject } from 'shared';
import { displayEnum } from '../../../utils/pipes';
import DiffSectionCreate from './DiffSectionCreate';
import DiffSectionEdit from './DiffSectionEdit';

interface DiffSectionProps {
  changeRequest: StandardChangeRequest;
}

enum ChangeRequestAction {
  CREATE_PROJECT = 'CREATE_PROJECT',
  CREATE_WORK_PACKAGE = 'CREATE_WORK_PACKAGE',
  EDIT_PROJECT = 'EDIT_PROJECT',
  EDIT_WORK_PACKAGE = 'EDIT_WORK_PACKAGE'
}

const DiffSection: React.FC<DiffSectionProps> = ({ changeRequest }) => {
  const { wbsNum, projectProposedChanges, workPackageProposedChanges } = changeRequest;
  const isOnProject = isProject(wbsNum);

  const changeRequestAction: ChangeRequestAction =
    projectProposedChanges && projectProposedChanges.carNumber !== undefined
      ? ChangeRequestAction.CREATE_PROJECT
      : isOnProject && workPackageProposedChanges
      ? ChangeRequestAction.CREATE_WORK_PACKAGE
      : isOnProject
      ? ChangeRequestAction.EDIT_PROJECT
      : ChangeRequestAction.EDIT_WORK_PACKAGE;

  const projectProposedChangesPreview: ProjectProposedChangesPreview | undefined = projectProposedChanges
    ? {
        name: projectProposedChanges.name,
        summary: projectProposedChanges.summary,
        lead: projectProposedChanges.lead,
        manager: projectProposedChanges.manager,
        teams: projectProposedChanges.teams,
        budget: projectProposedChanges.budget,
        goals: projectProposedChanges.goals,
        features: projectProposedChanges.features,
        rules: projectProposedChanges.rules,
        otherConstraints: projectProposedChanges.otherConstraints,
        links: projectProposedChanges.links
      }
    : undefined;

  const originalProjectData: ProjectProposedChangesPreview | undefined = changeRequest.originalProjectData && {
    name: changeRequest.originalProjectData.name,
    summary: changeRequest.originalProjectData.summary,
    lead: changeRequest.originalProjectData.lead,
    manager: changeRequest.originalProjectData.manager,
    teams: changeRequest.originalProjectData.teams,
    budget: changeRequest.originalProjectData.budget,
    goals: changeRequest.originalProjectData.goals,
    features: changeRequest.originalProjectData.features,
    rules: changeRequest.originalProjectData.rules,
    otherConstraints: changeRequest.originalProjectData.otherConstraints,
    links: changeRequest.originalProjectData.links
  };

  const originalWorkPackageData: WorkPackageProposedChangesPreview | undefined = changeRequest.originalWorkPackageData && {
    name: changeRequest.originalWorkPackageData.name,
    stage: changeRequest.originalWorkPackageData.stage,
    lead: changeRequest.originalWorkPackageData.lead,
    manager: changeRequest.originalWorkPackageData.manager,
    startDate: changeRequest.originalWorkPackageData.startDate,
    duration: changeRequest.originalWorkPackageData.duration,
    blockedBy: changeRequest.originalWorkPackageData.blockedBy,
    expectedActivities: changeRequest.originalWorkPackageData.expectedActivities,
    deliverables: changeRequest.originalWorkPackageData.deliverables
  };

  const workPackageProposedChangesPreview: WorkPackageProposedChangesPreview | undefined = workPackageProposedChanges
    ? {
        name: workPackageProposedChanges.name,
        stage: workPackageProposedChanges.stage,
        lead: workPackageProposedChanges.lead,
        manager: workPackageProposedChanges.manager,
        startDate: workPackageProposedChanges.startDate,
        duration: workPackageProposedChanges.duration,
        blockedBy: workPackageProposedChanges.blockedBy,
        expectedActivities: workPackageProposedChanges.expectedActivities,
        deliverables: workPackageProposedChanges.deliverables
      }
    : undefined;

  return (
    <Box>
      <InfoBlock title={`Proposed Changes - ${displayEnum(changeRequestAction)}`} />
      {changeRequestAction === ChangeRequestAction.CREATE_PROJECT ||
      changeRequestAction === ChangeRequestAction.CREATE_WORK_PACKAGE ? (
        <DiffSectionCreate
          projectProposedChanges={projectProposedChangesPreview}
          workPackageProposedChanges={workPackageProposedChangesPreview}
        />
      ) : (
        <DiffSectionEdit
          projectProposedChanges={projectProposedChangesPreview}
          workPackageProposedChanges={workPackageProposedChangesPreview}
          originalProjectData={originalProjectData}
          originalWorkPackageData={originalWorkPackageData}
          wbsNum={wbsNum}
        />
      )}
    </Box>
  );
};

export default DiffSection;
