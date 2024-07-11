import { Box } from '@mui/system';
import InfoBlock from '../../../components/InfoBlock';
import { StandardChangeRequest, isProject } from 'shared';
import { displayEnum } from '../../../utils/pipes';
import DiffSectionCreate from './DiffSectionCreate';
import DiffSectionEdit from './DiffSectionEdit';
import { projectProposedChangesToPreview, workPackageProposedChangesToPreview } from '../../../utils/diff-page.utils';

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

  const projectProposedChangesPreview = projectProposedChangesToPreview(projectProposedChanges);
  const originalProjectData = projectProposedChangesToPreview(changeRequest.originalProjectData);
  const originalWorkPackageData = workPackageProposedChangesToPreview(changeRequest.originalWorkPackageData);
  const workPackageProposedChangesPreview = workPackageProposedChangesToPreview(workPackageProposedChanges);

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
