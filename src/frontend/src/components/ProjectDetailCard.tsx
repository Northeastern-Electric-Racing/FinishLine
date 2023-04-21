import { Construction, Work } from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Card, CardContent, Link, Typography, Grid, Chip, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { isGuest, Project, WbsElementStatus, wbsPipe } from 'shared';
import { useToggleProjectFavorite } from '../hooks/projects.hooks';
import { useToast } from '../hooks/toasts.hooks';
import { useCurrentUser } from '../hooks/users.hooks';
import { fullNamePipe } from '../utils/pipes';
import WorkPackageStageChip from './WorkPackageStageChip';
import StarIcon from '@mui/icons-material/Star';

interface ProjectDetailCardProps {
  project: Project;
  projectIsFavorited: boolean;
}

const ProjectDetailCard: React.FC<ProjectDetailCardProps> = ({ project, projectIsFavorited }) => {
  const user = useCurrentUser();
  const toast = useToast();
  const { mutateAsync: mutateAsyncToggleProjectFavorite } = useToggleProjectFavorite(project.wbsNum);

  const containsWorkPackages = project.workPackages.length > 0;

  const handleClickFavorite = async () => {
    try {
      await mutateAsyncToggleProjectFavorite();
      toast.info(`Successfully ${projectIsFavorited ? 'un' : ''}favorited project ${wbsPipe(project.wbsNum)}!`);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const FavoriteButton = () => (
    <IconButton
      onClick={handleClickFavorite}
      disabled={isGuest(user.role)}
      sx={{ color: projectIsFavorited ? 'Gold' : undefined, mx: 1, mt: 0.5, maxHeight: '37.05px' }}
    >
      <StarIcon fontSize="large" stroke={'black'} strokeWidth={1} />
    </IconButton>
  );

  return (
    <Card sx={{ borderRadius: 5, minWidth: 600, maxWidth: 600, minHeight: 250 }}>
      <CardContent>
        <Grid container alignItems="center">
          <Grid item>
            <Link component={RouterLink} to={`/projects/${wbsPipe(project.wbsNum)}`}>
              <Typography variant="h5">
                {wbsPipe(project.wbsNum)} - {project.name}
              </Typography>
            </Link>
          </Grid>
          <Grid item xs>
            <Grid container direction="row-reverse">
              <FavoriteButton />
            </Grid>
          </Grid>
        </Grid>

        <Grid container sx={{ marginTop: '0.5rem' }}>
          <Grid item container xs={6}>
            <Grid item display="flex" sx={{ marginTop: 0.5 }} xs={12}>
              <ScheduleIcon sx={{ mr: 1 }} />
              <Typography>{project.duration} weeks left</Typography>
            </Grid>
            <Grid item display="flex" sx={{ marginTop: 0.5 }} xs={12}>
              <AttachMoneyIcon sx={{ mr: 0.5 }} /> <Typography>{project.budget}</Typography>
            </Grid>
            <Grid item display="flex" justifyContent="left" sx={{ marginTop: 0.5 }} xs={12}>
              <DescriptionIcon sx={{ mr: 1 }} />
              {project.gDriveLink ? (
                <Link href={project.gDriveLink} target="_blank" underline="hover">
                  Google Drive
                </Link>
              ) : (
                'No Link'
              )}
            </Grid>
          </Grid>

          <Grid item container xs={6}>
            <Grid item xs={12}>
              <Chip icon={<Construction />} label={fullNamePipe(project.projectLead)} size="medium" />
            </Grid>
            <Grid item xs={12}>
              <Chip sx={{ marginTop: 1 }} icon={<Work />} label={fullNamePipe(project.projectManager)} size="medium" />
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Active Work Packages:</Typography>
          {containsWorkPackages ? (
            project.workPackages
              .filter((workPackage) => workPackage.status === WbsElementStatus.Active)
              .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
              .map((workPackage) => {
                return (
                  <Grid container sx={{ my: 1 }}>
                    <Grid item xs={6}>
                      <Link component={RouterLink} to={`/projects/${wbsPipe(workPackage.wbsNum)}`}>
                        {wbsPipe(workPackage.wbsNum)} - {workPackage.name}
                      </Link>
                    </Grid>
                    <Grid item xs={3} display="flex" justifyContent="left">
                      <WorkPackageStageChip stage={workPackage.stage} />
                    </Grid>
                    <Grid item xs={3} display="flex" justifyContent="flex-end">
                      <Box display="flex">
                        <ScheduleIcon sx={{ mr: 1 }} /> <Typography>{workPackage.duration} weeks left</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                );
              })
          ) : (
            <Typography>None</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectDetailCard;
