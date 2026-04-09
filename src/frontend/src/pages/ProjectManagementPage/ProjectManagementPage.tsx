import { Grid } from '@mui/material';
import { GuestDefinition } from 'shared';
import PageLayout from '../../components/PageLayout';
import ProjectManagementCard from './ProjectManagementCard';

const ProjectManagementPage: React.FC = () => {
  // replace when hook is ready
  const definitions: GuestDefinition[] = [
    {
      definitionId: '1',
      term: 'NER',
      description: 'A really awesome organization!',
      order: 1,
      buttonText: 'learn more!',
      buttonLink: '/home'
    },
    {
      definitionId: '2',
      term: 'NER2',
      description: 'A really awesome organization2!',
      order: 0,
      buttonText: 'learn more2!',
      buttonLink: '/home'
    }
  ];

  return (
    <PageLayout title="Project Management">
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {definitions
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
