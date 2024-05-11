import { Card, CardContent, Typography, Link } from '@mui/material';
import { ProjectPreview } from 'shared';
import { routes } from '../../utils/routes';
import { fullNamePipe, wbsPipe } from '../../utils/pipes';
import { useSingleProject } from '../../hooks/projects.hooks';
import { Link as RouterLink } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

interface ActiveProjectCardViewProps {
  project: ProjectPreview;
}
const ActiveProjectCardView: React.FC<ActiveProjectCardViewProps> = ({ project }) => {
  const { isLoading, isError, error, data } = useSingleProject(project.wbsNum);
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  return (
    <Card sx={{ minWidth: 300, maxWidth: 400, minHeight: 200 }}>
      <CardContent>
        <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(data.wbsNum)}`}>
          {wbsPipe(data.wbsNum) + ' - ' + data.name}
        </Link>
        <Typography sx={{ mb: 1.5 }}>{'Project Lead: ' + fullNamePipe(data.lead)}</Typography>
        <Typography sx={{ mb: 1.5 }}>{'Summary: ' + data.summary}</Typography>
      </CardContent>
    </Card>
  );
};

export default ActiveProjectCardView;
