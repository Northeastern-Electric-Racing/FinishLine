import { Card, CardContent, Typography, Link } from '@mui/material';
import { BaseProject } from 'shared';
import { routes } from '../../utils/routes';
import { fullNamePipe, wbsPipe } from '../../utils/pipes';
import { Link as RouterLink } from 'react-router-dom';

interface ActiveProjectCardViewProps {
  project: Pick<BaseProject, 'wbsNum' | 'name' | 'lead' | 'summary'>;
}
const ActiveProjectCardView: React.FC<ActiveProjectCardViewProps> = ({ project }) => {
  return (
    <Card sx={{ minWidth: 300, maxWidth: 400, minHeight: 200 }}>
      <CardContent>
        <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(project.wbsNum)}`}>
          {wbsPipe(project.wbsNum) + ' - ' + project.name}
        </Link>
        <Typography sx={{ mb: 1.5 }}>{'Project Lead: ' + fullNamePipe(project.lead)}</Typography>
        <Typography sx={{ mb: 1.5 }}>{'Summary: ' + project.summary}</Typography>
      </CardContent>
    </Card>
  );
};

export default ActiveProjectCardView;
