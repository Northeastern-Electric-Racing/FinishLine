/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faFilePowerpoint, faFolderOpen, faList, faListOl } from '@fortawesome/free-solid-svg-icons';
import { Project } from 'shared';
import { datePipe, dollarsPipe, endDatePipe, fullNamePipe, weeksPipe } from '../../../utils/Pipes';
import ExternalLink from '../../../components/ExternalLink';
import WbsStatus from '../../../components/WbsStatus';
import PageBlock from '../../../layouts/PageBlock';
import { Grid, Typography } from '@mui/material';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const start =
    project.workPackages.length > 0
      ? datePipe(
          project.workPackages.reduce(
            (min, cur) => (cur.startDate < min ? cur.startDate : min),
            project.workPackages[0].startDate
          )
        )
      : 'n/a';
  const end =
    project.workPackages.length > 0
      ? endDatePipe(
          project.workPackages.reduce(
            (min, cur) => (cur.startDate < min ? cur.startDate : min),
            project.workPackages[0].startDate
          ),
          project.workPackages.reduce((tot, cur) => tot + cur.duration, 0)
        )
      : 'n/a';

  return (
    <PageBlock title={'Project Details'} headerRight={<WbsStatus status={project.status} />}>
      <Grid container spacing={1}>
        <Grid item xs={1}>
          <Typography>Project Lead: </Typography>
        </Grid>
        <Grid item xs={1}>
          {fullNamePipe(project.projectLead)}
        </Grid>

        <Grid item xs={2}>
          <Typography>Project Manager: </Typography>
        </Grid>
        <Grid item xs={1}>
          {fullNamePipe(project.projectManager)}
        </Grid>

        <Grid item xs={1}>
          <Typography>Duration: </Typography>
        </Grid>
        <Grid item xs={1}>
          {weeksPipe(project.duration)}
        </Grid>

        <Grid item xs={1}>
          <Typography>Start Date: </Typography>
        </Grid>
        <Grid item xs={1}>
          {start}
        </Grid>

        <Grid item xs={1}>
          <Typography>End Date: </Typography>
        </Grid>
        <Grid item xs={2}>
          {end}
        </Grid>
        <Grid item xs={1}>
          <Typography>Budget: </Typography>
        </Grid>
        <Grid item xs={11}>
          {dollarsPipe(project.budget)}
        </Grid>
        <Grid item xs={1}>
          <Typography>Links: </Typography>
        </Grid>

        <Grid item xs={2}>
          <ExternalLink icon={faFilePowerpoint} link={project.slideDeckLink!} description={'Slide Deck'} />
        </Grid>
        <Grid item xs={2}>
          <ExternalLink icon={faList} link={project.taskListLink!} description={'Task List'} />
        </Grid>
        <Grid item xs={2}>
          <ExternalLink icon={faListOl} link={project.bomLink!} description={'BOM'} />
        </Grid>
        <Grid item xs={2}>
          <ExternalLink icon={faFolderOpen} link={project.gDriveLink!} description={'Google Drive'} />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProjectDetails;
