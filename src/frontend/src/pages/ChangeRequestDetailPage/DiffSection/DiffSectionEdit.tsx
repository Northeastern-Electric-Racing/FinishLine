import { Box, Grid } from '@mui/material';
import {
  Project,
  ProjectProposedChangesPreview,
  WbsNumber,
  WorkPackage,
  WorkPackageProposedChangesPreview,
  equalsWbsNumber
} from 'shared';
import { useAllProjects } from '../../../hooks/projects.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useAllWorkPackages } from '../../../hooks/work-packages.hooks';
import {
  PotentialChangeType,
  ProposedChangeValue,
  projectToProposedChangesPreview,
  valueChanged,
  workPackageToProposedChangesPreview
} from '../../../utils/diff-page.utils';
import DiffPanel from './DiffPanel';

interface DiffSectionEditProps {
  projectProposedChanges?: ProjectProposedChangesPreview;
  workPackageProposedChanges?: WorkPackageProposedChangesPreview;
  wbsNum: WbsNumber;
}

const DiffSectionEdit: React.FC<DiffSectionEditProps> = ({ projectProposedChanges, workPackageProposedChanges, wbsNum }) => {
  const { data: projects, isLoading: projectsIsLoading, isError: projectsIsError, error: projectsError } = useAllProjects();
  const {
    data: workPackages,
    isLoading: workPackagesIsLoading,
    isError: workPackagesIsError,
    error: workPackagesError
  } = useAllWorkPackages();

  if (projectsIsLoading || workPackagesIsLoading || !projects || !workPackages) return <LoadingIndicator />;
  if (projectsIsError) return <ErrorPage message={projectsError.message} />;
  if (workPackagesIsError) return <ErrorPage message={workPackagesError.message} />;

  const project = projects.find((project: Project) => equalsWbsNumber(project.wbsNum, wbsNum));
  const workPackage = workPackages.find((workPackage: WorkPackage) => equalsWbsNumber(workPackage.wbsNum, wbsNum));

  const isOnProject = !!projectProposedChanges;

  const originalMap: Map<string, PotentialChangeType> = new Map();
  const proposedMap: Map<string, PotentialChangeType> = new Map();

  const projectAsChanges = projectToProposedChangesPreview(project);
  const workPackageAsChanges = workPackageToProposedChangesPreview(workPackage);

  if (isOnProject) {
    for (var projectKey in projectProposedChanges) {
      if (projectProposedChanges.hasOwnProperty(projectKey)) {
        const originalValue = projectAsChanges![projectKey as keyof ProjectProposedChangesPreview]!;
        const proposedValue = projectProposedChanges[projectKey as keyof ProjectProposedChangesPreview]!;
        if (valueChanged(originalValue as ProposedChangeValue, proposedValue)) {
          originalMap.set(projectKey, PotentialChangeType.SAME);
          proposedMap.set(projectKey, PotentialChangeType.SAME);
        } else {
          originalMap.set(projectKey, PotentialChangeType.REMOVED);
          proposedMap.set(projectKey, PotentialChangeType.ADDED);
        }
      }
    }
  } else {
    for (var workPackageKey in workPackageProposedChanges) {
      if (workPackageProposedChanges.hasOwnProperty(workPackageKey)) {
        const originalValue = workPackageAsChanges![workPackageKey as keyof WorkPackageProposedChangesPreview]!;
        const proposedValue = workPackageProposedChanges[workPackageKey as keyof WorkPackageProposedChangesPreview]!;
        if (valueChanged(originalValue as ProposedChangeValue, proposedValue)) {
          originalMap.set(workPackageKey, PotentialChangeType.REMOVED);
          proposedMap.set(workPackageKey, PotentialChangeType.ADDED);
        } else {
          originalMap.set(workPackageKey, PotentialChangeType.SAME);
          proposedMap.set(workPackageKey, PotentialChangeType.SAME);
        }
      }
    }
  }

  return (
    <Grid container columnSpacing={4}>
      <Grid item xs={6}>
        <Box borderRadius="10px" p={1.4} mb={3} sx={{ backgroundColor: '#2C2C2C' }}>
          <DiffPanel
            projectProposedChanges={projectAsChanges}
            workPackageProposedChanges={workPackageAsChanges}
            potentialChangeTypeMap={originalMap}
          />
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box borderRadius="10px" p={1.4} mb={3} sx={{ backgroundColor: '#2C2C2C' }}>
          <DiffPanel
            projectProposedChanges={projectProposedChanges}
            workPackageProposedChanges={workPackageProposedChanges}
            potentialChangeTypeMap={proposedMap}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default DiffSectionEdit;
