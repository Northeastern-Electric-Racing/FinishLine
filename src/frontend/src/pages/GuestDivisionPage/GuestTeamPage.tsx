import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Box, useMediaQuery } from '@mui/system';
import PageLayout from '../../components/PageLayout';
import GuestSubteamCard from './GuestSubteamCard';
import { useAllTeams } from '../../hooks/teams.hooks';

interface GuestTeamPageProps {
  teamTypeId: string;
}

const GuestTeamPage: React.FC<GuestTeamPageProps> = ({ teamTypeId }) => {
  const isMobilePortrait = useMediaQuery('(max-width:480px)');
  const { isLoading: teamsIsLoading, isError: teamsIsError, data: allTeams, error: teamsError } = useAllTeams();
  const teams = allTeams?.filter((team) => team.teamType?.teamTypeId === teamTypeId);

  if (teamsIsLoading || !teams) return <LoadingIndicator />;
  if (teamsIsError) return <ErrorPage message={teamsError.message} />;

  if (teams.length === 0) return <ErrorPage message="No teams found for this division" />;

  return (
    <PageLayout title={teams[0].teamType!.name}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobilePortrait ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobilePortrait ? 2 : 3,
          width: '100%',
          px: isMobilePortrait ? 1 : 0
        }}
      >
        {teams.map((team) => (
          <GuestSubteamCard key={team.teamId} team={team} />
        ))}
      </Box>
    </PageLayout>
  );
};

export default GuestTeamPage;
