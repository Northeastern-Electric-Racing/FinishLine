import { ProjectProposedChangesPreview, WorkPackageProposedChangesPreview } from 'shared';
import { Box } from '@mui/system';
import { PotentialChangeType, potentialChangeBackgroundMap } from '../../../utils/diff-page.utils';
import DiffPanel from './DiffPanel';
import { Grid } from '@mui/material';

interface DiffSectionCreateProps {
  projectProposedChanges?: ProjectProposedChangesPreview;
  workPackageProposedChanges?: WorkPackageProposedChangesPreview;
}

const DiffSectionCreate: React.FC<DiffSectionCreateProps> = ({ projectProposedChanges, workPackageProposedChanges }) => {
  const isCreateProject = !!projectProposedChanges;
  const potentialChangeTypeMap: Map<string, PotentialChangeType> = new Map();
  delete workPackageProposedChanges?.lead;
  delete workPackageProposedChanges?.manager;

  if (isCreateProject) {
    for (var projectKey in projectProposedChanges) {
      if (projectProposedChanges.hasOwnProperty(projectKey)) {
        potentialChangeTypeMap.set(projectKey, PotentialChangeType.ADDED);
      }
    }
  } else {
    for (var workPackageKey in workPackageProposedChanges) {
      if (workPackageProposedChanges.hasOwnProperty(workPackageKey)) {
        potentialChangeTypeMap.set(workPackageKey, PotentialChangeType.ADDED);
      }
    }
  }

  return (
    <Grid item xs={6}>
      <Box
        borderRadius="10px"
        p={1.4}
        mb={3}
        sx={{ backgroundColor: potentialChangeBackgroundMap.get(PotentialChangeType.ADDED) }}
      >
        <DiffPanel
          projectProposedChanges={projectProposedChanges}
          workPackageProposedChanges={workPackageProposedChanges}
          potentialChangeTypeMap={potentialChangeTypeMap}
        />
      </Box>
    </Grid>
  );
};

export default DiffSectionCreate;
