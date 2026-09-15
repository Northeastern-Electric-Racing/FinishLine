import { Box } from '@mui/system';
import InfoBlock from '../../../components/InfoBlock';
import { isProjectWbs, StandardChangeRequest } from 'shared';
import ProjectDiffSection from './ProjectDiffSection';
import WorkPackageDiffSection from './WorkPackageDiffSection';
import LoadingIndicator from '../../../components/LoadingIndicator';
import DiffSectionEdit from './DiffSectionEdit';
import { getChangesForWorkPackage } from '../../../utils/diff-page.utils';
import NewProjectDiffSection from './NewProjectDiffSection';

interface DiffSectionProps {
  changeRequest: StandardChangeRequest;
}

const DiffSection: React.FC<DiffSectionProps> = ({ changeRequest }) => {
  const { wbsNum, projectProposedChanges, workPackageProposedChanges } = changeRequest;

  return (
    <Box>
      <InfoBlock title={`Proposed Changes`} />
      {wbsNum ? (
        projectProposedChanges ? (
          isProjectWbs(wbsNum) ? (
            <ProjectDiffSection projectProposedChanges={projectProposedChanges} wbsNum={wbsNum} />
          ) : (
            <NewProjectDiffSection projectProposedChanges={projectProposedChanges} />
          )
        ) : workPackageProposedChanges ? (
          wbsNum.workPackageNumber === 0 ? (
            <DiffSectionEdit collections={[getChangesForWorkPackage(undefined, workPackageProposedChanges)]} />
          ) : (
            <WorkPackageDiffSection workPackageProposedChanges={workPackageProposedChanges} wbsNum={wbsNum} />
          )
        ) : (
          <></>
        )
      ) : (
        <LoadingIndicator />
      )}
    </Box>
  );
};

export default DiffSection;
