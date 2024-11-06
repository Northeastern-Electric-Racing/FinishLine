import WorkPackageCard from './WorkPackageCard';
import { wbsPipe } from '../../../utils/pipes';
import Box from '@mui/material/Box';
import ScrollablePageBlock from './ScrollablePageBlock';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { AuthenticatedUser } from 'shared';

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
        heading={"You're team is all caught up!"}
        message={'There are no work packages assigned to your team!'}
      />
    </Box>
  );
};

const TeamWorkPackageDisplay: React.FC<TeamWorkPackageDisplayProps> = ({ user }) => {
  const teamsAsHead = user.teamsAsHead ?? [];
  const teamsAsLead = user.teamsAsLead ?? [];
  const teamsAsLeadership = [...teamsAsHead, ...teamsAsLead];

  // converting to set to remove duplicates
  const workPackages = new Set(
    teamsAsLeadership
      .map((team) => {
        return team.projects.map((project) => {
          return project.workPackages;
        });
      })
      .flat(2)
  );

  return (
    <ScrollablePageBlock title={`My Team's Work Packages (${workPackages.size})`}>
      {workPackages.size === 2 ? (
        <NoTeamWorkPackagesDisplay />
      ) : (
        [...workPackages].map((wp) => (
          <Box key={wbsPipe(wp.wbsNum)} sx={{ mb: 1 }}>
            <WorkPackageCard wp={wp} />
          </Box>
        ))
      )}
    </ScrollablePageBlock>
  );
};

export default TeamWorkPackageDisplay;
