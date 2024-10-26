import WorkPackageCard from './WorkPackageCard';
import { wbsPipe } from '../../../utils/pipes';
import Box from '@mui/material/Box';
import { useAllTeams } from '../../../hooks/teams.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { Card, CardContent, Typography, useTheme } from '@mui/material';

const TeamWorkPackageDisplay: React.FC = () => {
  const theme = useTheme();
  const user = useCurrentUser();
  const { isLoading, isError, data: teams, error } = useAllTeams();

  if (isLoading || !teams) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

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

  return (
    <Box sx={{ width: '40%', float: 'left', padding: '1vh' }}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          overflowY: 'auto',
          justifyContent: 'flex-start',
          height: '80vh',
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
        variant="outlined"
      >
        <CardContent sx={{ height: `100%`, marginBottom: '10vh' }}>
          <Typography mb={1} variant="h5">
            {`My Team's Work Packages (${workPackages.length})`}
          </Typography>
          {workPackages.length === 0
            ? `No work packages`
            : workPackages.map((wp) => (
                <Box key={wbsPipe(wp.wbsNum)} sx={{ marginBottom: '1vh' }}>
                  <WorkPackageCard wp={wp} />
                </Box>
              ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeamWorkPackageDisplay;
