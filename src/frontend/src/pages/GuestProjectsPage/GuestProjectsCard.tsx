import { alpha, Box, Card, CardContent, Chip, Stack, Typography, useTheme, Link } from '@mui/material';
import { wbsNamePipe, ProjectListItem, wbsPipe } from 'shared';
import { datePipe } from '../../utils/pipes';
import { NERButton } from '../../components/NERButton';
import { Link as RouterLink } from 'react-router-dom';

interface ProjectCardProps {
  project: ProjectListItem;
}

const GuestProjectsCard: React.FC<ProjectCardProps> = ({ project }) => {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.paper,
        borderRadius: 2
      }}
    >
      <CardContent sx={{ padding: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box width={'100%'}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                fontWeight={'regular'}
                variant="h5"
                sx={{ marginBottom: '0.3rem', fontSize: { xs: '1.15rem', sm: '1.5rem' }, flexGrow: 1 }}
              >
                {wbsNamePipe(project)}
              </Typography>
              {project.activeStage ? (
                <Chip
                  size="medium"
                  variant="filled"
                  sx={{
                    marginLeft: 'auto',
                    fontSize: 12,
                    bgcolor: alpha(theme.palette.primary.main, 0.45),
                    color: theme.palette.primary.light
                  }}
                  label={project.activeStage}
                />
              ) : null}
            </Box>
            <Typography fontSize={12} color="text.secondary">
              Project Lead:{' '}
              {project.lead?.firstName && project.lead?.lastName
                ? `${project.lead.firstName} ${project.lead.lastName}`
                : 'N/A'}
              {' • '}
              Project Manager:{' '}
              {project.manager?.firstName && project.manager?.lastName
                ? `${project.manager.firstName} ${project.manager.lastName}`
                : 'N/A'}
            </Typography>
            <Typography fontWeight={'regular'} fontSize={{ xs: 14, sm: 16 }}>
              {datePipe(project.startDate) + ' ⟝ ' + project.duration + ' wks ⟞ ' + datePipe(project.endDate)}
            </Typography>
          </Box>
        </Stack>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.4,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {project.summary}
        </Typography>
        <Link
          component={RouterLink}
          to={`/projects/${wbsPipe(project.wbsNum)}`}
          sx={{ width: '100%', textDecoration: 'none' }}
        >
          <NERButton
            fullWidth
            sx={{
              marginTop: 2,
              backgroundColor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.error.dark
              }
            }}
          >
            Learn more
          </NERButton>
        </Link>
      </CardContent>
    </Card>
  );
};

export default GuestProjectsCard;
