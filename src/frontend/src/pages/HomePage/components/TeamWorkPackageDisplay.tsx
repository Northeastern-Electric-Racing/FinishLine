import WorkPackageCard from './WorkPackageCard';
import { wbsPipe } from '../../../utils/pipes';
import Box from '@mui/material/Box';
import ScrollablePageBlock from './ScrollablePageBlock';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { AuthenticatedUser, WbsElementStatus } from 'shared';
import { useAllTeams } from '../../../hooks/teams.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { isUserOnTeam } from '../../../utils/teams.utils';

interface TeamWorkPackageDisplayProps {
  user: AuthenticatedUser;
}

const NoTeamWorkPackagesDisplay: React.FC = () => {
  return (
    <Box
      sx={{
        height: `calc(100vh - 200px)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <EmptyPageBlockDisplay
        icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 128 }} />}
        heading={'No Active Work Packages'}
        message={'There are no active work packages assigned to your team!'}
      />
    </Box>
  );
};

const TeamWorkPackageDisplay: React.FC<TeamWorkPackageDisplayProps> = ({ user }) => {
  const { isLoading, isError, data: teams, error } = useAllTeams();

  if (isLoading || !teams) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const myTeams = teams.filter((team) => isUserOnTeam(team, user));

  const workPackages = myTeams
    .map((team) => {
      return team.projects.map((project) => {
        return project.workPackages.filter((wp) => wp.status === WbsElementStatus.Active);
      });
    })
    .flat(2);

  return (
    <ScrollablePageBlock title={`My Team's Work Packages (${workPackages.length})`}>
      {workPackages.length === 0 ? (
        <NoTeamWorkPackagesDisplay />
      ) : (
        workPackages.map((wp) => (
          <Box key={wbsPipe(wp.wbsNum)} sx={{ mb: 1 }}>
            <WorkPackageCard wp={wp} />
          </Box>
        ))
      )}
    </ScrollablePageBlock>
  );
};

export default TeamWorkPackageDisplay;
