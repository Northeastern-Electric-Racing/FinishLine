import { Grid } from '@mui/material';
import { Box } from '@mui/system';
import InfoBlock from '../../../components/InfoBlock';
import { ProjectProposedChangesPreview, StandardChangeRequest, WorkPackageProposedChangesPreview, isProject } from 'shared';
import { displayEnum } from '../../../utils/pipes';
import { DiffSectionCreate } from './DiffSectionCreate';

interface DiffSectionProps {
  changeRequest: StandardChangeRequest;
}

enum ChangeRequestAction {
  CREATE_PROJECT = 'CREATE_PROJECT',
  CREATE_WORK_PACKAGE = 'CREATE_WORK_PACKAGE',
  EDIT_PROJECT = 'EDIT_PROJECT',
  EDIT_WORK_PACKAGE = 'EDIT_WORK_PACKAGE'
}

export const DiffSection: React.FC<DiffSectionProps> = ({ changeRequest }) => {
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
        status: projectProposedChanges.status,
        links: projectProposedChanges.links,
        projectLead: projectProposedChanges.projectLead,
        projectManager: projectProposedChanges.projectManager,
        summary: projectProposedChanges.summary,
        budget: projectProposedChanges.budget,
        rules: projectProposedChanges.rules,
        goals: projectProposedChanges.goals,
        features: projectProposedChanges.features,
        otherConstraints: projectProposedChanges.otherConstraints,
        teams: projectProposedChanges.teams
      }
    : undefined;

  const workPackageProposedChangesPreview: WorkPackageProposedChangesPreview | undefined = workPackageProposedChanges
    ? {
        name: workPackageProposedChanges.name,
        status: workPackageProposedChanges.status,
        links: workPackageProposedChanges.links,
        projectLead: workPackageProposedChanges.projectLead,
        projectManager: workPackageProposedChanges.projectManager,
        startDate: workPackageProposedChanges.startDate,
        duration: workPackageProposedChanges.duration,
        blockedBy: workPackageProposedChanges.blockedBy,
        expectedActivities: workPackageProposedChanges.expectedActivities,
        deliverables: workPackageProposedChanges.deliverables,
        stage: workPackageProposedChanges.stage
      }
    : undefined;

  return (
    <Box>
      <InfoBlock title={`Proposed Changes - ${displayEnum(changeRequestAction)}`} />
      <Grid container columnSpacing={4}>
        {changeRequestAction === ChangeRequestAction.CREATE_PROJECT ||
        changeRequestAction === ChangeRequestAction.CREATE_WORK_PACKAGE ? (
          <Grid item xs={6}>
            <DiffSectionCreate
              projectProposedChanges={projectProposedChangesPreview}
              workPackageProposedChanges={workPackageProposedChangesPreview}
            />
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
    </Box>
  );
};
