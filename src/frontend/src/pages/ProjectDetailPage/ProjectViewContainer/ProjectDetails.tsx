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
          <Typography>{fullNamePipe(project.projectLead)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Project Manager: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>{fullNamePipe(project.projectManager)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Duration: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>{weeksPipe(project.duration)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Start Date: </Typography>
        </Grid>
        <Grid item xs={3} md={2}>
          <Typography>{datePipe(project.startDate) || 'n/a'}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>End Date: </Typography>
        </Grid>
        <Grid item xs={5} md={2}>
          <Typography>{datePipe(project.endDate) || 'n/a'}</Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>Budget: </Typography>
        </Grid>
        <Grid item xs={10} md={2}>
          <Typography>{dollarsPipe(project.budget)}</Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>Links: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>
            <ExternalLink icon={faFilePowerpoint} link={project.slideDeckLink!} description={'Slide Deck'} />
          </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>
            <ExternalLink icon={faList} link={project.taskListLink!} description={'Task List'} />
          </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>
            <ExternalLink icon={faListOl} link={project.bomLink!} description={'BOM'} />
          </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>
            <ExternalLink icon={faFolderOpen} link={project.gDriveLink!} description={'Google Drive'} />
          </Typography>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProjectDetails;
