import { Box } from '@mui/system';
import InfoBlock from '../../../components/InfoBlock';
import { StandardChangeRequest } from 'shared';
import ProjectDiffSection from './ProjectDiffSection';
import WorkPackageDiffSection from './WorkPackageDiffSection';
interface DiffSectionProps {
  changeRequest: StandardChangeRequest;
}

const DiffSection: React.FC<DiffSectionProps> = ({ changeRequest }) => {
  const { wbsNum, projectProposedChanges, workPackageProposedChanges } = changeRequest;

  return (
    <Box>
      <InfoBlock title={`Proposed Changes`} />
      {projectProposedChanges ? (
        <ProjectDiffSection projectProposedChanges={projectProposedChanges} wbsNum={wbsNum} />
      ) : workPackageProposedChanges ? (
        <WorkPackageDiffSection workPackageProposedChanges={workPackageProposedChanges} wbsNum={wbsNum} />
      ) : (
        <></>
      )}
    </Box>
  );
};

export default DiffSection;
