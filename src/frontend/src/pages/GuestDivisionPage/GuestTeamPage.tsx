import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Box, useMediaQuery } from '@mui/system';
import PageLayout from '../../components/PageLayout';
import GuestSubteamCard from './GuestSubteamCard';
import { useAllTeams } from '../../hooks/teams.hooks';
import { useParams } from 'react-router-dom';

interface ParamTypes {
  teamId: string;
}

const GuestTeamPage: React.FC = () => {
  const isMobilePortrait = useMediaQuery('(max-width:480px)');
  const { teamId } = useParams<ParamTypes>();
  const { isLoading: teamsIsLoading, isError: teamsIsError, data: allTeams, error: teamsError } = useAllTeams();

  if (teamsIsLoading || !allTeams) return <LoadingIndicator />;
  if (teamsIsError) return <ErrorPage message={teamsError.message} />;

  const filteredTeams = allTeams.filter((team) => team.teamType?.teamTypeId === teamId);

  if (filteredTeams.length === 0) return <ErrorPage message="No teams found for this division" />;

  return (
    <PageLayout title={filteredTeams[0].teamType!.name}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobilePortrait ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobilePortrait ? 2 : 3,
          width: '100%',
          px: isMobilePortrait ? 1 : 0
        }}
      >
        {filteredTeams.map((team) => (
          <GuestSubteamCard key={team.teamId} team={team} />
        ))}
      </Box>
    </PageLayout>
  );
};

export default GuestTeamPage;
