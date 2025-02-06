import WorkPackageCard from './WorkPackageCard';
import ScrollablePageBlock from './ScrollablePageBlock';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { AuthenticatedUser, WbsElementStatus, WorkPackage } from 'shared';
import { useAllTeams } from '../../../hooks/teams.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { isUserOnTeam } from '../../../utils/teams.utils';

interface TeamWorkPackageDisplayProps {
  user: AuthenticatedUser;
}

const NoTeamWorkPackagesDisplay: React.FC = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 128 }} />}
      heading={'No Active Work Packages'}
      message={'There are no active work packages assigned to your team!'}
    />
  );
};

const TeamWorkPackageDisplay: React.FC<TeamWorkPackageDisplayProps> = ({ user }) => {
  const { isLoading, isError, data: teams, error } = useAllTeams();

  if (isLoading || !teams) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const myTeams = teams.filter((team) => isUserOnTeam(team, user));

  const workPackages = myTeams
    //convert list of teams into list of work packages in projects in those teams
    .map((team) => {
      return team.projects.map((project) => {
        return project.workPackages.filter((wp) => wp.status === WbsElementStatus.Active);
      });
    })
    //flatten into 1 dimensional list of work packages
    .flat(2)
    //remove duplicate work packages
    .reduce((acc: WorkPackage[], wp: WorkPackage) => {
      if (acc.filter((addedWp) => addedWp.id === wp.id).length === 0) {
        acc.push(wp);
      }
      return acc;
    }, []);

  return (
    <ScrollablePageBlock title={`My Team's Work Packages (${workPackages.length})`}>
      {workPackages.length === 0 ? <NoTeamWorkPackagesDisplay /> : workPackages.map((wp) => <WorkPackageCard wp={wp} />)}
    </ScrollablePageBlock>
  );
};

export default TeamWorkPackageDisplay;
