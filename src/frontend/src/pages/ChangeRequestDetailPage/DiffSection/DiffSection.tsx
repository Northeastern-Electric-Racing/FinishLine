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
        descriptionBullets: projectProposedChanges.descriptionBullets,
        links: projectProposedChanges.links
      }
    : undefined;

  const workPackageProposedChangesPreview: WorkPackageProposedChangesPreview | undefined = workPackageProposedChanges
    ? {
        name: workPackageProposedChanges.name,
        stage: workPackageProposedChanges.stage,
        lead: workPackageProposedChanges.lead,
        manager: workPackageProposedChanges.manager,
        startDate: workPackageProposedChanges.startDate,
        duration: workPackageProposedChanges.duration,
        blockedBy: workPackageProposedChanges.blockedBy,
        descriptionBullets: workPackageProposedChanges.descriptionBullets
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
