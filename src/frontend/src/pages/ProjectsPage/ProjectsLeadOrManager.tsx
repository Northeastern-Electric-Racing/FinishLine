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
 * Cards of all projects that this user is Project Lead/Manager for
 */
const ProjectsLeadOrManager: React.FC = () => {
  const { isLoading, data, isError, error } = useAllProjects();
  const auth = useAuth();

  if (isLoading || !data) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const projectLeadOrManagerProjects = data?.filter(
    (project) => auth.user?.userId === project.projectLead?.userId || auth.user?.userId === project.projectManager?.userId
  );

  return (
    <>
      {projectLeadOrManagerProjects.length ? (
        <Grid container marginTop={1} spacing={1}>
          {projectLeadOrManagerProjects?.map((project) => (
            <Grid item md={6} xs={12}>
              <ProjectDetailCard project={project} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container marginTop={1} spacing={1} justifyContent={'center'}>
          <Typography align={'center'} marginTop={'10%'} variant={'h6'}>
            You're Not Leading or Managing Any Projects
          </Typography>
        </Grid>
      )}
    </>
  );
};

export default ProjectsLeadOrManager;
