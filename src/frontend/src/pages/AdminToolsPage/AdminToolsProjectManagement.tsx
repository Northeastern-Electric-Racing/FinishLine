/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NERButton } from '../../components/NERButton';
import { Grid, Typography, useTheme } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import { useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { projectWbsPipe } from '../../utils/pipes';
import { Project } from 'shared';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useToast } from '../../hooks/toasts.hooks';
import { useAllProjects } from '../../hooks/projects.hooks';
// import { batman } from '../../../../backend/tests/test-data/users.test-data';
// import ProjectsService from '../../../../backend/src/services/projects.services';


const AdminToolsProjectManagement: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [hideSuccessLabel, setHideSuccessLabel] = useState(true);
  const { isLoading, isError, error, data: projects } = useAllProjects();
  const theme = useTheme();
  const toast = useToast();

  if (isLoading || !projects) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const projectsSearchOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      const project = projects.find((project: Project) => project.id.toString() === value.id);
      if (project) {
        setProject(project);
      }
    } else {
      setProject(null);
    }
  };

  const handleProjectClick = async () => {
    setHideSuccessLabel(true);
    if (!project) return;
    try {
      //await ProjectsService.deleteProject(batman, project.wbsNum);
      setHideSuccessLabel(false);
      setProject(null);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const projectToAutocompleteOption = (project: Project): { label: string; id: string } => {
    return { label: `${projectWbsPipe(project.wbsNum)}`, id: project.id.toString() };
  };

  return (
    <PageBlock title={'Project Deletion'}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={10} sx={{ mb : 2 }}>
          <NERAutocomplete
            id="project-autocomplete"
            onChange={projectsSearchOnChange}
            options={projects.map(projectToAutocompleteOption)}
            size="small"
            placeholder="Type a project name in here. Or WBS number"
            value={project ? projectToAutocompleteOption(project) : null}
          />
        </Grid>
      </Grid>
      <NERButton
        sx={{ mt: '20px', float: 'right' }}
        variant="contained"
        disabled={!project}
        onClick={handleProjectClick}
      >
        Delete Project
      </NERButton>
      <Typography hidden={hideSuccessLabel} style={{ color: theme.palette.primary.main, marginTop: '20px' }}>
        Successfully Deleted Project
      </Typography>
    </PageBlock>
  );
};

export default AdminToolsProjectManagement;
