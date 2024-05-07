/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Construction, Work } from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Card, CardContent, Link, Typography, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { calculateDaysLeftInProject, daysBetween, Project, TaskStatus, WbsElementStatus, wbsPipe } from 'shared';
import { daysOrWeeksLeftOrLate, emDashPipe, fullNamePipe } from '../utils/pipes';
import WorkPackageStageChip from './WorkPackageStageChip';
import FavoriteProjectButton from './FavoriteProjectButton';
import TaskIcon from '@mui/icons-material/Task';
import DoneIcon from '@mui/icons-material/Done';
import LinkView from './Link/LinkView';

interface ProjectDetailCardProps {
  project: Project;
  projectIsFavorited: boolean;
}

const ProjectDetailCard: React.FC<ProjectDetailCardProps> = ({ project, projectIsFavorited }) => {
  const containsActiveWorkPackages = project.workPackages.filter((wp) => wp.status === WbsElementStatus.Active).length;
  const tasksLeft: number = project.tasks.filter((task) => task.status !== TaskStatus.DONE).length;

  const ProjectDetailCardTitle = () => (
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
  );

  const daysLeft = calculateDaysLeftInProject(project);

  const confluenceLink = project.links.find((link) => link.linkType.name === 'Confluence');

  const ProjectDetailCardDetails = () => (
    <Grid container sx={{ marginTop: '0.5rem' }}>
      <Grid item display="flex" xs={4}>
        <Construction sx={{ mr: 1 }} /> <Typography>{fullNamePipe(project.lead)}</Typography>
      </Grid>
      <Grid item display="flex" sx={{ marginTop: 0.5 }} xs={4}>
        {project.status === WbsElementStatus.Complete ? (
          <>
            <DoneIcon sx={{ mr: 1 }} />
            <Typography>Done!</Typography>
          </>
        ) : (
          <>
            <ScheduleIcon sx={{ mr: 1 }} />
            <Typography>{daysLeft ? daysOrWeeksLeftOrLate(daysLeft) : emDashPipe('')}</Typography>
          </>
        )}
      </Grid>
      <Grid item display="flex" justifyContent="left" sx={{ marginTop: 0.5 }} xs={4}>
        <TaskIcon sx={{ mr: 1 }} /> <Typography>{`${tasksLeft} task${tasksLeft === 1 ? '' : 's'} left`}</Typography>
      </Grid>
      <Grid item display="flex" xs={4}>
        <Work sx={{ mr: 1 }} /> <Typography>{fullNamePipe(project.manager)}</Typography>
      </Grid>
      {confluenceLink && (
        <Grid item display="flex" justifyContent="left" sx={{ marginTop: 0.5 }} xs={4}>
          <LinkView link={confluenceLink} />
        </Grid>
      )}
      <Grid item display="flex" sx={{ marginTop: 0.5 }} xs={4}>
        <AttachMoneyIcon sx={{ mr: 1 }} /> <Typography>{project.budget}</Typography>
      </Grid>
    </Grid>
  );

  const ProjectDetailCardActiveWorkPackages = () => (
    <Box sx={{ marginTop: 2 }}>
      <Typography variant="h6">Active Work Packages:</Typography>
      {containsActiveWorkPackages ? (
        project.workPackages
          .filter((workPackage) => workPackage.status === WbsElementStatus.Active)
          .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
          .map((workPackage) => {
            const workPackageDaysLeft = daysBetween(workPackage.endDate, new Date());

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
                    <ScheduleIcon sx={{ mr: 1 }} /> <Typography>{daysOrWeeksLeftOrLate(workPackageDaysLeft)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            );
          })
      ) : (
        <Typography>None</Typography>
      )}
    </Box>
  );

  return (
    <Card sx={{ borderRadius: 5, minWidth: 600, maxWidth: 600, minHeight: 250 }}>
      <CardContent>
        <ProjectDetailCardTitle />
        <ProjectDetailCardDetails />
        <ProjectDetailCardActiveWorkPackages />
      </CardContent>
    </Card>
  );
};

export default ProjectDetailCard;
