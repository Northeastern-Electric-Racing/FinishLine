/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faFilePowerpoint, faFolderOpen, faList, faListOl } from '@fortawesome/free-solid-svg-icons';
import { Project } from 'shared';
import { datePipe, dollarsPipe, fullNamePipe, weeksPipe } from '../../../utils/Pipes';
import ExternalLink from '../../../components/ExternalLink';
import WbsStatus from '../../../components/WbsStatus';
import PageBlock from '../../../layouts/PageBlock';
import { Grid, Typography } from '@mui/material';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <PageBlock title={'Project Details'} headerRight={<WbsStatus status={project.status} />}>
      <Grid container spacing={1}>
        <Grid item xs={2} md={2}>
          <Typography>Project Lead: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          {fullNamePipe(project.projectLead)}
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Project Manager: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          {fullNamePipe(project.projectManager)}
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Duration: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          {weeksPipe(project.duration)}
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Start Date: </Typography>
        </Grid>
        <Grid item xs={3} md={2}>
          {datePipe(project.startDate) || 'n/a'}
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>End Date: </Typography>
        </Grid>
        <Grid item xs={5} md={2}>
          {datePipe(project.endDate) || 'n/a'}
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>Budget: </Typography>
        </Grid>
        <Grid item xs={10} md={2}>
          {dollarsPipe(project.budget)}
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>Links: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <ExternalLink icon={faFilePowerpoint} link={project.slideDeckLink!} description={'Slide Deck'} />
        </Grid>
        <Grid item xs={2} md={2}>
          <ExternalLink icon={faList} link={project.taskListLink!} description={'Task List'} />
        </Grid>
        <Grid item xs={2} md={2}>
          <ExternalLink icon={faListOl} link={project.bomLink!} description={'BOM'} />
        </Grid>
        <Grid item xs={2} md={2}>
          <ExternalLink icon={faFolderOpen} link={project.gDriveLink!} description={'Google Drive'} />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProjectDetails;
