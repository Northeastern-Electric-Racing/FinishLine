import { useAllProjects } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Box, useMediaQuery } from '@mui/system';
import { wbsPipe } from 'shared';
import PageLayout from '../../components/PageLayout';
import GuestProjectsCard from './GuestProjectsCard';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import { Chip } from '@mui/material';
import { useState } from 'react';

const GuestProjectsPage: React.FC = () => {
  const { data: allProjects, isLoading, isError, error } = useAllProjects();
  const [selectedTeamTypes, setSelectedTeamTypes] = useState<string[]>([]);
  const isMobilePortrait = useMediaQuery('(max-width:480px)');
  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: teamTypes,
    error: teamTypesError
  } = useAllTeamTypes();

  if (isLoading || !allProjects || teamTypesIsLoading || !teamTypes) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;
  if (teamTypesIsError) return <ErrorPage message={teamTypesError.message} />;

  const filteredProjects = allProjects.filter(
    (project) =>
      selectedTeamTypes.length === 0 || project.teamTypes.some((t) => t !== null && selectedTeamTypes.includes(t.name))
  );

  return (
    <PageLayout title="Projects">
      <Box
        width={'100%'}
        alignContent={'center'}
        display={'flex'}
        justifyContent={'center'}
        gap={2}
        flexWrap={'wrap'}
        mb={3}
      >
        {teamTypes.map((team) => (
          <Chip
            key={team.name}
            label={team.name}
            onClick={() =>
              setSelectedTeamTypes((prev) =>
                prev?.includes(team.name) ? prev.filter((t: string) => t !== team.name) : [...(prev || []), team.name]
              )
            }
            clickable
            color={selectedTeamTypes?.includes(team.name) ? 'primary' : 'default'}
          />
        ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobilePortrait ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobilePortrait ? 2 : 3,
          width: '100%',
          px: isMobilePortrait ? 1 : 0
        }}
      >
        {filteredProjects.map((p) => (
          <GuestProjectsCard key={wbsPipe(p.wbsNum)} project={p} />
        ))}
      </Box>
    </PageLayout>
  );
};

export default GuestProjectsPage;
