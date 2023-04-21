/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useAllProjects } from '../../hooks/projects.hooks';
import { useAuth } from '../../hooks/auth.hooks';
import ProjectDetailCard from '../../components/ProjectDetailCard';
import { Grid, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

/**
 * Cards of all projects that this user is in their team.
 */
const ProjectsInTeam: React.FC = () => {
  const { isLoading, data, isError, error } = useAllProjects();
  const auth = useAuth();

  if (isLoading || !data) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const inTeamProjects = data?.filter((project) =>
    project.team?.members.map((user) => user.userId).some((userId) => userId === auth.user?.userId)
  );

  return (
    <>
      {inTeamProjects.length ? (
        <Grid container marginTop={1} spacing={1}>
          {inTeamProjects?.map((project) => (
            <Grid item md={6} xs={12}>
              <ProjectDetailCard project={project} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container marginTop={1} spacing={1} justifyContent={'center'}>
          <Typography align={'center'} marginTop={'10%'} variant={'h6'}>
            Your Team Has No Projects
          </Typography>
        </Grid>
      )}
    </>
  );
};

export default ProjectsInTeam;
