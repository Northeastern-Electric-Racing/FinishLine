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
        projectLead: projectProposedChanges.projectLead,
        projectManager: projectProposedChanges.projectManager,
        teams: projectProposedChanges.teams,
        budget: projectProposedChanges.budget,
        goals: projectProposedChanges.goals,
        features: projectProposedChanges.features,
        rules: projectProposedChanges.rules,
        otherConstraints: projectProposedChanges.otherConstraints,
        links: projectProposedChanges.links
      }
    : undefined;

  const workPackageProposedChangesPreview: WorkPackageProposedChangesPreview | undefined = workPackageProposedChanges
    ? {
        name: workPackageProposedChanges.name,
        stage: workPackageProposedChanges.stage,
        projectLead: workPackageProposedChanges.projectLead,
        projectManager: workPackageProposedChanges.projectManager,
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
          wbsNum={wbsNum}
        />
      )}
    </Box>
  );
};

export default DiffSection;
