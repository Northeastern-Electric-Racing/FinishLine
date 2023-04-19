/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Folder, FormatListBulleted, FormatListNumbered, CoPresent } from '@mui/icons-material';
import Link from '@mui/material/Link';
import { Project } from 'shared';
import { datePipe, dollarsPipe, fullNamePipe, weeksPipe } from '../../../utils/pipes';
import WbsStatus from '../../../components/WbsStatus';
import PageBlock from '../../../layouts/PageBlock';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DetailDisplay from '../../../components/DetailDisplay';
import { useTheme } from '@mui/material';
import Chip from '@mui/material/Chip';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const theme = useTheme();
  const teamName = project.team ? project.team.teamName : 'No Team Assigned';
  return (
    // {<WbsStatus status={project.status} />} {<Chip size="small" label={teamName} color={color} sx={{ fontSize: 14 }} />}
    <PageBlock
      title={'Project Details'}
      headerRight={
        <b>
          <WbsStatus status={project.status} />{' '}
          <Chip size="small" label={teamName} color={'primary'} sx={{ fontSize: 14 }} />
        </b>
      }
    >
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
          <Stack direction="row" alignItems="center">
            <CoPresent sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            <Link href={project.slideDeckLink!} underline="always" fontSize={19} sx={{ pl: 1 }}>
              Slide Deck
            </Link>
          </Stack>
        </Grid>
        <Grid item xs={2} md={2}>
          <Stack direction="row" alignItems="center">
            <FormatListBulleted sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            <Link href={project.taskListLink!} underline="always" fontSize={19} sx={{ pl: 1 }}>
              Task List
            </Link>
          </Stack>
        </Grid>
        <Grid item xs={2} md={2}>
          <Stack direction="row" alignItems="center">
            <FormatListNumbered sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            <Link href={project.bomLink!} underline="always" fontSize={19} sx={{ pl: 1 }}>
              BOM
            </Link>
          </Stack>
        </Grid>
        <Grid item xs={2} md={2}>
          <Stack direction="row" alignItems="center">
            <Folder sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            <Link href={project.gDriveLink!} underline="always" fontSize={19} sx={{ pl: 1 }}>
              Google Drive
            </Link>
          </Stack>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProjectDetails;
