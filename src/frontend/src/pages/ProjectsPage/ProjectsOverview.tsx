/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useCurrentUser, useUsersFavoriteProjects } from '../../hooks/users.hooks';
import { useAllProjects } from '../../hooks/projects.hooks';
import ProjectsOverviewCards from './ProjectsOverviewCards';

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

  return (
    <Box>
      {favoriteProjects.length > 0 ? (
        <ProjectsOverviewCards projects={favoriteProjects} title="My Favorites" favoriteProjectsSet={favoriteProjectsSet} />
      ) : (
        <Typography sx={{ mt: 2 }}>You have no favorite projects. Click the star on a project's page to add one!</Typography>
      )}
      {myTeamsProjects.length > 0 && (
        <ProjectsOverviewCards
          projects={myTeamsProjects}
          title="My Team's Projects"
          favoriteProjectsSet={favoriteProjectsSet}
        />
      )}
      {projectsImLeading.length > 0 && (
        <ProjectsOverviewCards
          projects={projectsImLeading}
          title="Projects I'm Leading"
          favoriteProjectsSet={favoriteProjectsSet}
        />
      )}
    </Box>
  );
};

export default ProjectsOverview;
