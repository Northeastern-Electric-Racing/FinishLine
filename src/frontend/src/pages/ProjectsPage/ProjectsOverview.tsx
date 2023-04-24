/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import ProjectDetailCard from '../../components/ProjectDetailCard';
import { Box, Grid, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useCurrentUser, useUsersFavoriteProjects } from '../../hooks/users.hooks';
import { useAllProjects } from '../../hooks/projects.hooks';
import { Project } from 'shared';

/**
 * Cards of all projects this user has favorited
 */
const ProjectsOverview: React.FC = () => {
  const user = useCurrentUser();

  const { isLoading, data: favoriteProjects, isError, error } = useUsersFavoriteProjects(user.userId);
  const {
    isLoading: useAllProjectsIsLoading,
    data: projects,
    isError: useAllProjectsIsError,
    error: useAllProjectsError
  } = useAllProjects();

  if (isLoading || !favoriteProjects || useAllProjectsIsLoading || !projects) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;
  if (useAllProjectsIsError) return <ErrorPage message={useAllProjectsError?.message} />;

  const favoriteProjectsSet: Set<number> = new Set(favoriteProjects.map((project) => project.id));

  const projectsImLeading = projects.filter(
    (project) => project.projectLead?.userId === user.userId || project.projectManager?.userId === user.userId
  );
  const myTeamsProjects = projects.filter(
    (project) =>
      (user.teamAsLeadId && user.teamAsLeadId === project.team?.teamId) ||
      project.team?.members.map((member) => member.userId).includes(user.userId)
  );

  const DisplayProjectCards = ({ projects }: { projects: Project[] }) => (
    <Grid
      container
      spacing={3}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'auto',
        justifyContent: 'flex-start'
      }}
    >
      {projects
        .sort((a, b) => {
          const aEndDate = a.endDate?.getTime() || Number.MAX_SAFE_INTEGER;
          const bEndDate = b.endDate?.getTime() || Number.MAX_SAFE_INTEGER;
          return aEndDate - bEndDate;
        })
        .map((project) => (
          <Grid item>
            <ProjectDetailCard project={project} projectIsFavorited={favoriteProjectsSet.has(project.id)} />
          </Grid>
        ))}
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ cursor: 'pointer', mb: 2 }}>
        My Favorites
      </Typography>
      {favoriteProjects.length > 0 ? (
        <DisplayProjectCards projects={favoriteProjects} />
      ) : (
        <Typography sx={{ mt: 2 }}>You have no favorite projects. Click the star on a project's page to add one!</Typography>
      )}
      {myTeamsProjects.length > 0 && (
        <>
          <Typography variant="h5" sx={{ cursor: 'pointer', my: 2 }}>
            My Team's Projects
          </Typography>
          <DisplayProjectCards projects={myTeamsProjects} />
        </>
      )}
      {projectsImLeading.length > 0 && (
        <>
          <Typography variant="h5" sx={{ cursor: 'pointer', my: 2 }}>
            Projects I'm Leading
          </Typography>
          <DisplayProjectCards projects={projectsImLeading} />
        </>
      )}
    </Box>
  );
};

export default ProjectsOverview;
