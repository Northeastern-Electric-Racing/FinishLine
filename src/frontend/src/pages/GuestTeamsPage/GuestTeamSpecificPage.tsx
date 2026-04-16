import { Box, Grid, Stack, Typography } from '@mui/material';
import { useSingleTeam } from '../../hooks/teams.hooks';
import { useParams } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';
import { WbsElementStatus } from 'shared';
import { routes } from '../../utils/routes';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import GuestProjectsCard from '../GuestProjectsPage/GuestProjectsCard';

interface ParamTypes {
  teamId: string;
}

const GuestTeamSpecificPage: React.FC = () => {
  const { teamId } = useParams<ParamTypes>();
  const { isLoading, isError, data, error } = useSingleTeam(teamId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  const activeProjects = data.projects.filter((project) => project.status === WbsElementStatus.Active);

  const formatNames = (members: { firstName: string; lastName: string }[]) =>
    members.map((m) => `${m.firstName} ${m.lastName}`).join(', ');

  return (
    <PageLayout
      title={`${data.teamName}`}
      previousPages={
        data.teamType
          ? [
              { name: 'Divisions', route: routes.TEAMS },
              { name: data.teamType.name, route: `${routes.TEAMS}/${data.teamType.teamTypeId}` }
            ]
          : [{ name: 'Divisions', route: routes.TEAMS }]
      }
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
          {data.description}
        </Typography>
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          People
        </Typography>
        <Stack spacing={3}>
          <Box display="flex" alignItems="flex-start" gap={1.5}>
            <PersonOutlineOutlinedIcon sx={{ color: 'text.secondary', mt: 0.25 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Head
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.head.firstName} {data.head.lastName}
              </Typography>
            </Box>
          </Box>
          {data.leads && data.leads.length > 0 && (
            <Box display="flex" alignItems="flex-start" gap={1.5}>
              <GroupOutlinedIcon sx={{ color: 'text.secondary', mt: 0.25 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Leads
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatNames(data.leads)}
                </Typography>
              </Box>
            </Box>
          )}
          {data.members && data.members.length > 0 && (
            <Box display="flex" alignItems="flex-start" gap={1.5}>
              <GroupsOutlinedIcon sx={{ color: 'text.secondary', mt: 0.25 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Members
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatNames(data.members)}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Active Projects
        </Typography>
        <Grid container spacing={2}>
          {activeProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <GuestProjectsCard project={{ ...project, teamTypes: [] }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default GuestTeamSpecificPage;
