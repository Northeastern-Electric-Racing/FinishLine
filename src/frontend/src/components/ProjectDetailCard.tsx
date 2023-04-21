/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Construction, Work } from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Card, CardContent, Link, Typography, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Project, TaskStatus, WbsElementStatus, wbsPipe } from 'shared';
import { fullNamePipe } from '../utils/pipes';
import WorkPackageStageChip from './WorkPackageStageChip';
import FavoriteProjectButton from './FavoriteProjectButton';
import TaskIcon from '@mui/icons-material/Task';

interface ProjectDetailCardProps {
  project: Project;
  projectIsFavorited: boolean;
}

const ProjectDetailCard: React.FC<ProjectDetailCardProps> = ({ project, projectIsFavorited }) => {
  const containsWorkPackages = project.workPackages.length > 0;
  const tasksLeft: number = project.tasks.filter((task) => task.status !== TaskStatus.DONE).length;

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
          <Grid item xs display="flex" justifyContent="flex-end">
            <FavoriteProjectButton wbsNum={project.wbsNum} projectIsFavorited={projectIsFavorited} />
          </Grid>
        </Grid>

        <Grid container sx={{ marginTop: '0.5rem' }}>
          <Grid item display="flex" xs={4}>
            <Construction sx={{ mr: 1 }} /> <Typography>{fullNamePipe(project.projectLead)}</Typography>
          </Grid>
          <Grid item display="flex" sx={{ marginTop: 0.5 }} xs={4}>
            <ScheduleIcon sx={{ mr: 1 }} />
            <Typography>{project.duration} weeks left</Typography>
          </Grid>
          <Grid item display="flex" justifyContent="left" sx={{ marginTop: 0.5 }} xs={4}>
            <TaskIcon sx={{ mr: 1 }} /> <Typography>{`${tasksLeft} task${tasksLeft === 1 ? '' : 's'} left`}</Typography>
          </Grid>
          <Grid item display="flex" xs={4}>
            <Work sx={{ mr: 1 }} /> <Typography>{fullNamePipe(project.projectManager)}</Typography>
          </Grid>
          <Grid item display="flex" justifyContent="left" sx={{ marginTop: 0.5 }} xs={4}>
            <DescriptionIcon sx={{ mr: 1 }} />
            <Link href={project.gDriveLink} target="_blank" underline="hover">
              Google Drive
            </Link>
          </Grid>
          <Grid item display="flex" sx={{ marginTop: 0.5 }} xs={4}>
            <AttachMoneyIcon sx={{ mr: 1 }} /> <Typography>{project.budget}</Typography>
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
                    <Grid item xs={3} display="flex">
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
