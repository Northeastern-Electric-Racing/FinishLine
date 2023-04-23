/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useAllProjects } from '../../hooks/projects.hooks';
import ProjectDetailCard from '../../components/ProjectDetailCard';
import { Grid, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useCurrentUser } from '../../hooks/users.hooks';

/**
 * Cards of all projects this user has favorited
 */
const ProjectsFavorited: React.FC = () => {
  const { isLoading, data, isError, error } = useAllProjects();
  const user = useCurrentUser();

  if (isLoading || !data) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const favoritedProjects = data?.filter((project) => user.favoritedProjectsId?.includes(project.id));

  return (
    <>
      {favoritedProjects.length ? (
        <Grid container marginTop={1} spacing={1}>
          {favoritedProjects?.map((project) => (
            <Grid item md={6} xs={12}>
              <ProjectDetailCard project={project} projectIsFavorited={true} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container marginTop={1} spacing={1} justifyContent={'center'}>
          <Typography align={'center'} marginTop={'10%'} variant={'h6'}>
            You Have Not Favorited Any Projects
          </Typography>
        </Grid>
      )}
    </>
  );
};

export default ProjectsFavorited;
