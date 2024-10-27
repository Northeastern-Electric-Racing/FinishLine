import WorkPackageCard from './WorkPackageCard';
import { wbsPipe } from '../../../utils/pipes';
import Box from '@mui/material/Box';
import { useAllTeams } from '../../../hooks/teams.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import ScrollablePageBlock from './ScrollablePageBlock';

const TeamWorkPackageDisplay: React.FC = () => {
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
    <ScrollablePageBlock title={`My Team's Work Packages (${workPackages.length})`}>
      {workPackages.length === 0
        ? `No work packages`
        : workPackages.map((wp) => (
            <Box key={wbsPipe(wp.wbsNum)} sx={{ marginBottom: '1vh' }}>
              <WorkPackageCard wp={wp} />
            </Box>
          ))}
    </ScrollablePageBlock>
  );
};

export default TeamWorkPackageDisplay;
