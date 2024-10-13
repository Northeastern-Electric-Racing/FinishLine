import WorkPackageCard from './WorkPackageCard';
import PageBlock from '../../../layouts/PageBlock';
import { wbsPipe } from '../../../utils/pipes';
import Box from '@mui/material/Box';
import { useAllTeams } from '../../../hooks/teams.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useTheme } from '@mui/material';

const TeamWorkPackageDisplay: React.FC = () => {
  const theme = useTheme();
  const user = useCurrentUser();
  const { isLoading, isError, data: teams, error } = useAllTeams();
  const myTeams = teams?.filter((team) => {
    return (
      team.members.some((member) => member.userId === user.userId) ||
      team.leads.some((member) => member.userId === user.userId) ||
      team.head.userId === user.userId
    );
  });

  const workPackages = myTeams
    ?.map((team) => {
      return team.projects.map((project) => {
        return project.workPackages;
      });
    })
    .flat(2);

  if (!workPackages) return <ErrorPage message={error?.message} />;

  if (isLoading || !teams) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const fullDisplay = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        overflowY: 'auto',
        justifyContent: 'flex-start',
        height: '50vh',
        gap: 2,
        '&::-webkit-scrollbar': {
          width: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        }
      }}
    >
      {workPackages.length === 0
        ? `No work packages`
        : workPackages.map((wp) => (
            <Box key={wbsPipe(wp.wbsNum)}>
              <WorkPackageCard wp={wp} />
            </Box>
          ))}
    </Box>
  );

  return (
    <Box sx={{ width: '40%', float: 'left' }}>
      <PageBlock title={`My Team's Work Packages (${workPackages.length})`}>{fullDisplay}</PageBlock>
    </Box>
  );
};

export default TeamWorkPackageDisplay;
