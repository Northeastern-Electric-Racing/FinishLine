import { Card, CardContent, Typography } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import { ProjectPreview } from 'shared';
import { routes } from '../../utils/routes';
import { fullNamePipe, wbsPipe } from '../../utils/pipes';
import { useSingleProject } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Grid } from '@mui/material';

interface createCardProps {
  project: ProjectPreview;
}
const CreateCard: React.FC<createCardProps> = ({ project }) => {
  const { isLoading, isError, error, data } = useSingleProject(project.wbsNum);
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  if (data.status !== 'ACTIVE') return null;
  return (
    <>
      <Card sx={{ width: 345 }}>
        <CardContent>
          <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(data.wbsNum)}`}>
            {wbsPipe(data.wbsNum) + ' - ' + data.name}
          </Link>
          <Typography sx={{ mb: 1.5 }}>{'Project Lead: ' + fullNamePipe(data.projectLead)}</Typography>
          <Typography sx={{ mb: 1.5 }}>{'Summary: ' + data.summary}</Typography>
        </CardContent>
      </Card>
    </>
  );
};

interface ProjectcardsViewProps {
  projects: ProjectPreview[];
}

const ProjectCardsView: React.FC<ProjectcardsViewProps> = ({ projects }) => {
  return (
    <>
      <PageBlock title={'Active Projects'}>
        <Grid container spacing={2}>
          {projects.map((project) => (
            <Grid item key={project.id}>
              <CreateCard project={project} />
            </Grid>
          ))}
        </Grid>
      </PageBlock>
    </>
  );
};

export default ProjectCardsView;
