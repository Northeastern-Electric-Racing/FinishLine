import { Box } from '@mui/system';
import InfoBlock from '../../../components/InfoBlock';
import { isProjectWbs, StandardChangeRequest } from 'shared';
import ProjectDiffSection from './ProjectDiffSection';
import WorkPackageDiffSection from './WorkPackageDiffSection';
import LoadingIndicator from '../../../components/LoadingIndicator';
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
          <ProjectDiffSection projectProposedChanges={projectProposedChanges} wbsNum={wbsNum} />
        ) : workPackageProposedChanges ? (
          <WorkPackageDiffSection workPackageProposedChanges={workPackageProposedChanges} wbsNum={wbsNum} />
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
