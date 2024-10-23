import { Construction, Work } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Link, Stack, Typography, useTheme } from '@mui/material';
import { wbsPipe, Project } from 'shared';
import { datePipe, fullNamePipe, projectWbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}
// remove the collapseable part
const FeaturedProjectsCard: React.FC<ProjectCardProps> = ({ project }) => {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 'fit-content',
        mr: 3,
        background: theme.palette.background.default
      }}
    >
      <CardContent sx={{ padding: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography fontWeight={'regular'} variant="subtitle2" noWrap>
              <Link
                color={'text.primary'}
                component={RouterLink}
                to={`${routes.PROJECTS}/${projectWbsPipe(project.wbsNum)}`}
              >
                {projectWbsPipe(project.wbsNum)} - {project.teams}
              </Link>
            </Typography>
            <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(project.wbsNum)}`} noWrap>
              <Typography fontWeight={'regular'} variant="h5">
                {wbsPipe(project.wbsNum)} - {project.name}
              </Typography>
            </Link>
            <Typography fontWeight={'regular'} fontSize={20} variant="h6" noWrap>
              {datePipe(project.startDate) + ' ⟝ ' + project.duration + ' wks ⟞ ' + datePipe(project.endDate)}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" sx={{ marginTop: 1 }}>
          <Chip
            sx={{ marginTop: 1, marginRight: 2 }}
            icon={<Construction />}
            label={fullNamePipe(project.lead)}
            size="medium"
          />
          <Chip sx={{ marginTop: 1 }} icon={<Work />} label={fullNamePipe(project.manager)} size="medium" />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FeaturedProjectsCard;
