import { Grid } from '@mui/material';
import { GuestDefinitionType } from 'shared';
import PageLayout from '../../components/PageLayout';
import ProjectManagementCard from './ProjectManagementCard';
import { useAllGuestDefinitions } from '../../hooks/recruitment.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const ProjectManagementPage: React.FC = () => {
  const { data: definitions, isLoading, isError, error } = useAllGuestDefinitions();

  if (isError) {
    return <ErrorPage message={error.message} />;
  }
  if (isLoading || !definitions) return <LoadingIndicator />;

  const filteredDefinitions = definitions.filter((definition) => definition.type === GuestDefinitionType.PROJECT_MANAGEMENT);

  return (
    <PageLayout title="Project Management">
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {filteredDefinitions
          .sort((a, b) => a.order - b.order)
          .map((definition) => (
            <Grid item xs={12} sm={6} md={4} key={definition.definitionId} sx={{ display: 'flex' }}>
              <ProjectManagementCard definition={definition} />
            </Grid>
          ))}
      </Grid>
    </PageLayout>
  );
};

export default ProjectManagementPage;
