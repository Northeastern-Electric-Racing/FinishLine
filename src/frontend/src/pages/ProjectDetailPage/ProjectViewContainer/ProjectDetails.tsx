/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faFilePowerpoint, faFolderOpen, faList, faListOl } from '@fortawesome/free-solid-svg-icons';
import { Project } from 'shared';
import { datePipe, dollarsPipe, fullNamePipe, weeksPipe } from '../../../utils/pipes';
import ExternalLink from '../../../components/ExternalLink';
import WbsStatus from '../../../components/WbsStatus';
import PageBlock from '../../../layouts/PageBlock';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DetailDisplay from '../../../components/DetailDisplay';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <PageBlock title={'Project Details'} headerRight={<WbsStatus status={project.status} />}>
      <Grid container spacing={1}>
        <Grid item xs={4} md={4}>
          <DetailDisplay label="Project Lead" content={fullNamePipe(project.projectLead)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Start Date" content={datePipe(project.startDate) || 'n/a'} paddingRight={2} />
        </Grid>

        <Grid item xs={3} md={3}>
          <DetailDisplay label="Duration" content={weeksPipe(project.duration)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Project Manager" content={fullNamePipe(project.projectManager)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="End Date" content={datePipe(project.endDate) || 'n/a'} paddingRight={2} />
        </Grid>
        <Grid item xs={4} md={4}>
          <DetailDisplay label="Budget" content={dollarsPipe(project.budget)} paddingRight={2} />
        </Grid>
        <Grid item xs={1} md={1}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2, display: 'inline' }}>Links: </Typography>
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
