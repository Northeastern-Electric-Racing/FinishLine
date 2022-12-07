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
        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Project Lead:{' '}
          </Typography>
          <Typography display="inline">{fullNamePipe(project.projectLead)}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Project Manager:{' '}
          </Typography>
          <Typography display="inline">{fullNamePipe(project.projectManager)}</Typography>
        </Grid>

        <Grid item xs={3} md={3}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Duration:{' '}
          </Typography>
          <Typography display="inline">{weeksPipe(project.duration)}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Start Date:{' '}
          </Typography>
          <Typography display="inline">{datePipe(project.startDate) || 'n/a'}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            End Date:{' '}
          </Typography>
          <Typography display="inline">{datePipe(project.endDate) || 'n/a'}</Typography>
        </Grid>
        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Budget:{' '}
          </Typography>
          <Typography display="inline">{dollarsPipe(project.budget)}</Typography>
        </Grid>
        <Grid item xs={1} md={1}>
          <Typography sx={{ fontWeight: 'bold' }}>Links: </Typography>
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
