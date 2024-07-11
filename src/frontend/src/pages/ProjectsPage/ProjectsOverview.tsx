/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useCurrentUser, useUsersFavoriteProjects } from '../../hooks/users.hooks';
import { useAllProjects } from '../../hooks/projects.hooks';
import ProjectsOverviewCards from './ProjectsOverviewCards';
import { WbsElementStatus } from 'shared';
import { isUserOnTeam } from '../../utils/teams.utils';

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

  const favoriteProjectsSet: Set<string> = new Set(favoriteProjects.map((project) => project.id));

  const projectsImLeading = projects.filter(
    (project) =>
      (project.status !== WbsElementStatus.Complete && project.lead?.userId === user.userId) ||
      project.manager?.userId === user.userId
  );
  const myTeamsProjects = projects.filter(
    (project) => project.status !== WbsElementStatus.Complete && project.teams.some((team) => isUserOnTeam(team, user))
  );

  return (
    <Box>
      <ProjectsOverviewCards
        projects={favoriteProjects}
        title="My Favorites"
        favoriteProjectsSet={favoriteProjectsSet}
        emptyMessage="You have no favorite projects. Click the star on a project's page to add one!"
      />

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
