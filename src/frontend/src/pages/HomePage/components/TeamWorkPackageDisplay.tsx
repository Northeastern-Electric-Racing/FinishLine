import WorkPackageCard from './WorkPackageCard';
import ScrollablePageBlock from './ScrollablePageBlock';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useMyTeamsWorkpackages } from '../../../hooks/teams.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface TeamWorkPackageDisplayProps {}

const NoTeamWorkPackagesDisplay: React.FC = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 128 }} />}
      heading={'No Active Work Packages'}
      message={'There are no active work packages assigned to your team!'}
    />
  );
};

const TeamWorkPackageDisplay: React.FC<TeamWorkPackageDisplayProps> = () => {
  const { isLoading, isError, data: workPackages, error } = useMyTeamsWorkpackages();

  if (isLoading || !workPackages) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <ScrollablePageBlock title={`My Team's Work Packages (${workPackages.length})`}>
      {workPackages.length === 0 ? <NoTeamWorkPackagesDisplay /> : workPackages.map((wp) => <WorkPackageCard wp={wp} />)}
    </ScrollablePageBlock>
  );
};

export default TeamWorkPackageDisplay;
