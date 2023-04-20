import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Card, CardContent, Link, Typography, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Project, wbsPipe } from 'shared';
import WorkPackageStageChip from './WorkPackageStageChip';

interface ProjectDetailCardProps {
  project: Project;
}

const ProjectDetailCard: React.FC<ProjectDetailCardProps> = ({ project }) => {
  const containsWorkPackages = project.workPackages.length > 0;

  return (
    <Card sx={{ borderRadius: 5 }}>
      <CardContent>
        <Link component={RouterLink} to={`/projects/${wbsPipe(project.wbsNum)}`}>
          <Typography variant="h5">
            {wbsPipe(project.wbsNum)} - {project.name}
          </Typography>
        </Link>

        <Grid container sx={{ marginTop: '0.5rem' }}>
          <Grid item display="flex" sx={{ marginTop: 0.5 }} xs={4}>
            <ScheduleIcon sx={{ mr: 1 }} />
            <Typography>{project.duration} weeks left</Typography>
          </Grid>
          <Grid item display="flex" sx={{ marginTop: 0.5 }} xs={4}>
            <AttachMoneyIcon sx={{ mr: 0.5 }} /> <Typography>{project.budget}</Typography>
          </Grid>
          <Grid item display="flex" sx={{ marginTop: 0.5 }} xs={4}>
            <DescriptionIcon sx={{ mr: 1 }} />
            {project.gDriveLink ? (
              <Link href={project.gDriveLink} target="_blank" underline="hover">
                Link
              </Link>
            ) : (
              'No Link'
            )}
          </Grid>
        </Grid>

        <Box sx={{ marginTop: 1 }}>
          <Typography variant="h6">Active Work Packages:</Typography>

          {containsWorkPackages ? (
            project.workPackages.map((workPackage) => {
              return (
                <Grid container sx={{ my: 1 }}>
                  <Grid item xs={6}>
                    <Link component={RouterLink} to={`/projects/${wbsPipe(workPackage.wbsNum)}`}>
                      {wbsPipe(workPackage.wbsNum)} - {workPackage.name}
                    </Link>
                  </Grid>

                  <Grid item xs={3}>
                    <Box display="flex">
                      <ScheduleIcon sx={{ mr: 1 }} /> <Typography>{workPackage.duration} weeks left</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3} justifyContent="end">
                    <WorkPackageStageChip stage={workPackage.stage} />
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
