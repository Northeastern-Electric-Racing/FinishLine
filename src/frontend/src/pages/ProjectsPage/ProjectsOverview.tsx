/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useCurrentUser, useUsersFavoriteProjects } from '../../hooks/users.hooks';
import ProjectsOverviewCards from './ProjectsOverviewCards';
import { useGetUsersLeadingProjects, useGetUsersTeamsProjects } from '../../hooks/projects.hooks';

/**
 * Cards of all projects this user has favorited
 */
const ProjectsOverview: React.FC = () => {
  const user = useCurrentUser();

  const { isLoading, data: favoriteProjects, isError, error } = useUsersFavoriteProjects(user.userId);
  const {
    isLoading: leadingProjectsIsLoading,
    data: leadingProjects,
    isError: leadingProjectsIsError,
    error: leadingProjectsError
  } = useGetUsersLeadingProjects();

  const {
    isLoading: teamsProjectsIsLoading,
    data: teamsProjects,
    isError: teamsProjectsIsError,
    error: teamsProjectsError
  } = useGetUsersTeamsProjects();

  if (isError) return <ErrorPage message={error?.message} />;
  if (leadingProjectsIsError) return <ErrorPage message={leadingProjectsError?.message} />;
  if (teamsProjectsIsError) return <ErrorPage message={teamsProjectsError?.message} />;

  if (
    isLoading ||
    !favoriteProjects ||
    leadingProjectsIsLoading ||
    teamsProjectsIsLoading ||
    !teamsProjects ||
    !leadingProjects
  )
    return <LoadingIndicator />;

  const favoriteProjectsSet: Set<string> = new Set(favoriteProjects.map((project) => project.id));

  return (
    <Box>
      <ProjectsOverviewCards
        projects={favoriteProjects}
        title="My Favorites"
        favoriteProjectsSet={favoriteProjectsSet}
        emptyMessage="You have no favorite projects. Click the star on a project's page to add one!"
      />

      {teamsProjects.length > 0 && (
        <ProjectsOverviewCards
          projects={teamsProjects}
          title="My Team's Projects"
          favoriteProjectsSet={favoriteProjectsSet}
        />
      )}
      {leadingProjects.length > 0 && (
        <ProjectsOverviewCards
          projects={leadingProjects}
          title="Projects I'm Leading"
          favoriteProjectsSet={favoriteProjectsSet}
        />
      )}
    </Box>
  );
};

export default ProjectsOverview;
