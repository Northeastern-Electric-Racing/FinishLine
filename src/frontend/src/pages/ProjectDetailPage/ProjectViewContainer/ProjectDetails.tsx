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
import { DetailDisplayProps } from '../../../components/DetailDisplay';

const ProjectDetailsDetailDisplay: React.FC<DetailDisplayProps> = ({ label, content }) => {
  return <DetailDisplay label={label} content={content} paddingRight={2}></DetailDisplay>;
};

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <PageBlock title={'Project Details'} headerRight={<WbsStatus status={project.status} />}>
      <Grid container spacing={1}>
        <Grid item xs={4} md={4}>
          <ProjectDetailsDetailDisplay
            label="Project Lead"
            content={fullNamePipe(project.projectLead)}
          ></ProjectDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <ProjectDetailsDetailDisplay
            label="Start Date"
            content={datePipe(project.startDate) || 'n/a'}
          ></ProjectDetailsDetailDisplay>
        </Grid>

        <Grid item xs={3} md={3}>
          <ProjectDetailsDetailDisplay label="Duration" content={weeksPipe(project.duration)}></ProjectDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <ProjectDetailsDetailDisplay
            label="Project Manager"
            content={fullNamePipe(project.projectManager)}
          ></ProjectDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <ProjectDetailsDetailDisplay
            label="End Date"
            content={datePipe(project.endDate) || 'n/a'}
          ></ProjectDetailsDetailDisplay>
        </Grid>
        <Grid item xs={4} md={4}>
          <ProjectDetailsDetailDisplay label="Budget" content={dollarsPipe(project.budget)}></ProjectDetailsDetailDisplay>
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
