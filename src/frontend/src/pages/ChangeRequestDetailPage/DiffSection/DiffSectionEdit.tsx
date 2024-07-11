import { Box, Grid } from '@mui/material';
import {
  Project,
  ProjectProposedChangesPreview,
  WbsNumber,
  WorkPackage,
  WorkPackageProposedChangesPreview,
  calculateEndDate,
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
import { useTheme } from '@mui/material';

interface DiffSectionEditProps {
  projectProposedChanges?: ProjectProposedChangesPreview;
  workPackageProposedChanges?: WorkPackageProposedChangesPreview;
  originalProjectData?: ProjectProposedChangesPreview;
  originalWorkPackageData?: WorkPackageProposedChangesPreview;
  wbsNum: WbsNumber;
}

const DiffSectionEdit: React.FC<DiffSectionEditProps> = ({
  projectProposedChanges,
  workPackageProposedChanges,
  originalProjectData,
  originalWorkPackageData,
  wbsNum
}) => {
  const { data: projects, isLoading: projectsIsLoading, isError: projectsIsError, error: projectsError } = useAllProjects();
  const {
    data: workPackages,
    isLoading: workPackagesIsLoading,
    isError: workPackagesIsError,
    error: workPackagesError
  } = useAllWorkPackages();

  const theme = useTheme();

  if (projectsIsLoading || workPackagesIsLoading || !projects || !workPackages) return <LoadingIndicator />;
  if (projectsIsError) return <ErrorPage message={projectsError.message} />;
  if (workPackagesIsError) return <ErrorPage message={workPackagesError.message} />;

  const project = projects.find((project: Project) => equalsWbsNumber(project.wbsNum, wbsNum));
  const workPackage = workPackages.find((workPackage: WorkPackage) => equalsWbsNumber(workPackage.wbsNum, wbsNum));

  const isOnProject = !!projectProposedChanges;

  const originalMap: Map<string, PotentialChangeType> = new Map();
  const proposedMap: Map<string, PotentialChangeType> = new Map();

  const projectAsChanges = originalProjectData ?? projectToProposedChangesPreview(project);
  const workPackageAsChanges = originalWorkPackageData ?? workPackageToProposedChangesPreview(workPackage);

  if (isOnProject) {
    for (const projectKey in projectProposedChanges) {
      if (projectProposedChanges.hasOwnProperty(projectKey)) {
        const originalValue = projectAsChanges![projectKey as keyof ProjectProposedChangesPreview]!;
        const proposedValue = projectProposedChanges[projectKey as keyof ProjectProposedChangesPreview]!;
        if (projectKey === 'workPackageProposedChanges') {
          for (const workPackage of projectProposedChanges.workPackageProposedChanges) {
            for (let workPackageKey in workPackage) {
              if (workPackage.hasOwnProperty(workPackageKey)) {
                if (workPackageKey === 'duration') {
                  workPackageKey = 'endDate';

                  const startDate = new Date(
                    new Date(workPackage.startDate).getTime() - new Date(workPackage.startDate).getTimezoneOffset() * -6000
                  );

                  const { duration } = workPackage;
                  const endDate = calculateEndDate(startDate, duration);
                  if (valueChanged(originalValue as ProposedChangeValue, endDate)) {
                    originalMap.set(workPackageKey, PotentialChangeType.REMOVED);
                    proposedMap.set(workPackageKey, PotentialChangeType.ADDED);
                  } else {
                    originalMap.set(workPackageKey, PotentialChangeType.SAME);
                    proposedMap.set(workPackageKey, PotentialChangeType.SAME);
                  }
                } else if (
                  valueChanged(
                    originalValue as ProposedChangeValue,
                    workPackage[workPackageKey as keyof WorkPackageProposedChangesPreview]!
                  )
                ) {
                  originalMap.set(workPackageKey, PotentialChangeType.REMOVED);
                  proposedMap.set(workPackageKey, PotentialChangeType.ADDED);
                } else {
                  originalMap.set(workPackageKey, PotentialChangeType.SAME);
                  proposedMap.set(workPackageKey, PotentialChangeType.SAME);
                }
              }
            }
          }
        } else if (valueChanged(originalValue as ProposedChangeValue, proposedValue as ProposedChangeValue)) {
          originalMap.set(projectKey, PotentialChangeType.REMOVED);
          proposedMap.set(projectKey, PotentialChangeType.ADDED);
        } else {
          originalMap.set(projectKey, PotentialChangeType.SAME);
          proposedMap.set(projectKey, PotentialChangeType.SAME);
        }
      }
    }
  } else {
    for (let workPackageKey in workPackageProposedChanges) {
      if (workPackageProposedChanges.hasOwnProperty(workPackageKey)) {
        let originalValue = workPackageAsChanges![workPackageKey as keyof WorkPackageProposedChangesPreview]!;
        let proposedValue = workPackageProposedChanges[workPackageKey as keyof WorkPackageProposedChangesPreview]!;

        if (workPackageKey === 'duration') {
          workPackageKey = 'endDate';
          originalValue = calculateEndDate(
            new Date(
              new Date(workPackage!.startDate).getTime() - new Date(workPackage!.startDate).getTimezoneOffset() * -60000
            ),
            originalValue as number
          );
          proposedValue = calculateEndDate(
            new Date(
              new Date(workPackageProposedChanges!.startDate).getTime() -
                new Date(workPackageProposedChanges!.startDate).getTimezoneOffset() * -60000
            ),
            proposedValue as number
          );
        }

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
        <Box borderRadius="10px" p={1.4} mb={3} sx={{ backgroundColor: theme.palette.background.paper }}>
          <DiffPanel
            projectProposedChanges={projectAsChanges}
            workPackageProposedChanges={workPackageAsChanges}
            potentialChangeTypeMap={originalMap}
          />
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box borderRadius="10px" p={1.4} mb={3} sx={{ backgroundColor: theme.palette.background.paper }}>
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
