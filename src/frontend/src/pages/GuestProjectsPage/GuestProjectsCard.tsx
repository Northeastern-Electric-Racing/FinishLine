import { alpha, Box, Card, CardContent, Chip, Stack, Typography, useTheme, useMediaQuery, Link } from '@mui/material';
import { wbsNamePipe, ProjectPreview, wbsPipe, WbsElementStatus } from 'shared';
import { datePipe } from '../../utils/pipes';
import { NERButton } from '../../components/NERButton';
import { useSingleProject } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Link as RouterLink } from 'react-router-dom';

interface ProjectCardProps {
  project: ProjectPreview;
}

const GuestProjectsCard: React.FC<ProjectCardProps> = ({ project }) => {
  const theme = useTheme();
  const isMobilePortrait = useMediaQuery('(max-width:600px)');
  const { data: singleProject, isLoading, isError, error } = useSingleProject(project.wbsNum);
  if (isLoading || !singleProject) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const activeWorkPackages = project.workPackages.filter((wp) => wp.status === WbsElementStatus.Active);

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 'fit-content',
        minHeight: 'fit-content',
        width: isMobilePortrait ? '100%' : 'auto',
        background: theme.palette.background.paper,
        borderRadius: 2
      }}
    >
      <CardContent sx={{ padding: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box width={'100%'}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                fontWeight={'regular'}
                variant="h5"
                sx={{ marginBottom: '0.3rem', fontSize: { xs: '1.15rem', sm: '1.5rem' }, flexGrow: 1 }}
              >
                {wbsNamePipe(singleProject)}
              </Typography>
              {activeWorkPackages[0] ? (
                <Chip
                  size="medium"
                  variant="filled"
                  sx={{
                    marginLeft: 'auto',
                    fontSize: 12,
                    bgcolor: alpha(theme.palette.primary.main, 0.45),
                    color: theme.palette.primary.light
                  }}
                  label={activeWorkPackages[0]?.stage}
                />
              ) : null}
            </Box>
            <Typography fontSize={12} color="text.secondary">
              Project Lead:{' '}
              {singleProject.lead?.firstName && singleProject.lead?.lastName
                ? `${singleProject.lead.firstName} ${singleProject.lead.lastName}`
                : 'N/A'}
              {' • '}
              Project Manager:{' '}
              {singleProject.manager?.firstName && singleProject.manager?.lastName
                ? `${singleProject.manager.firstName} ${singleProject.manager.lastName}`
                : 'N/A'}
            </Typography>
            <Typography fontWeight={'regular'} fontSize={{ xs: 14, sm: 16 }} noWrap>
              {datePipe(singleProject.startDate) +
                ' ⟝ ' +
                singleProject.duration +
                ' wks ⟞ ' +
                datePipe(singleProject.endDate)}
            </Typography>
          </Box>
        </Stack>
        <Typography>{singleProject.summary}</Typography>
        <Box alignItems={'center'} display={'flex'} justifyContent={'center'} marginTop={2}>
          <Link component={RouterLink} to={`/projects/${wbsPipe(project.wbsNum)}`}>
            <NERButton
              sx={{
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
        </Box>
      </CardContent>
    </Card>
  );
};

export default GuestProjectsCard;
