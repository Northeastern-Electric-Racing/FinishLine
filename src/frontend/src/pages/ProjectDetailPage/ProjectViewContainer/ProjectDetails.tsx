/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Construction, Work } from '@mui/icons-material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Folder, FormatListNumbered, CoPresent } from '@mui/icons-material';
import Link from '@mui/material/Link';
import { Project, WorkPackage, wbsPipe } from 'shared';
import { datePipe, dollarsPipe, fullNamePipe, weeksPipe } from '../../../utils/pipes';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import Chip from '@mui/material/Chip';
import WorkPackageSummary from './WorkPackageSummary';
import DetailDisplay from '../../../components/DetailDisplay';
import { Box } from '@mui/material';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const theme = useTheme();
  const teamName = project.team ? project.team.teamName : 'No Team';
  return (
    <Grid container display="flex" flexDirection="row" sx={{ mt: '10px' }}>
      <Grid item sm={12} md={6} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography
            variant="h5"
            sx={{
              cursor: 'pointer',
              mb: 1
            }}
          >
            Details
          </Typography>
          <Chip
            size="medium"
            label={teamName}
            color={'primary'}
            sx={{ fontSize: 14, fontWeight: 700, marginRight: '20px' }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <Construction sx={{ mr: 2 }} />
            <DetailDisplay label="Project Lead" content={fullNamePipe(project.projectLead)} paddingRight={1} />
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <ScheduleIcon sx={{ mr: 2 }} />
            <DetailDisplay label="Start Date" content={datePipe(project.startDate) || 'n/a'} paddingRight={1} />
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <Work sx={{ mr: 2 }} />
            <DetailDisplay label="Project Manager" content={fullNamePipe(project.projectManager)} paddingRight={1} />
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <ScheduleIcon sx={{ mr: 2 }} />
            <DetailDisplay label="End Date" content={datePipe(project.endDate) || 'n/a'} paddingRight={1} />
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <AttachMoneyIcon sx={{ mr: 2 }} />
            <DetailDisplay label="Budget" content={dollarsPipe(project.budget)} paddingRight={1} />
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <ScheduleIcon sx={{ mr: 2 }} />
            <DetailDisplay label="Duration" content={weeksPipe(project.duration)} paddingRight={1} />
          </Grid>
        </Grid>
      </Grid>

      <Grid container display="flex" flexDirection="row" item sm={12} md={6} sx={{ mb: 2 }}>
        <Grid item xs sx={{ mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 1,
              cursor: 'pointer'
            }}
          >
            Summary
          </Typography>
          <Typography>{project.summary}</Typography>
        </Grid>

        <Grid container item xs={12}>
          <Grid item xs={12}>
            <Typography
              variant="h5"
              sx={{
                mb: 1,
                cursor: 'pointer'
              }}
            >
              Links
            </Typography>
          </Grid>
          <Grid item xs={6} display="flex" alignItems="center">
            <Folder sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            <Link href={project.gDriveLink!} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
              Google Drive
            </Link>
          </Grid>

          <Grid item xs={6} display="flex" alignItems="center">
            <CoPresent sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            {/* TODO: slide deck changed to confluence in frontend - needs to be updated in the backend */}
            <Link href={project.slideDeckLink!} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
              Confluence
            </Link>
          </Grid>
          <Grid item xs={6} display="flex" alignItems="center">
            <FormatListNumbered sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            <Link href={project.bomLink!} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
              BOM
            </Link>
          </Grid>
        </Grid>
      </Grid>

      <Grid container item display="flex">
        <Grid item xs={12}>
          <Typography
            variant="h5"
            sx={{
              mb: 1,
              cursor: 'pointer'
            }}
          >
            Work Packages
          </Typography>
        </Grid>
        {project.workPackages.map((ele: WorkPackage) => (
          <Grid item xs={12} key={wbsPipe(ele.wbsNum)} sx={{ mb: 0.5 }}>
            <WorkPackageSummary workPackage={ele} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default ProjectDetails;
