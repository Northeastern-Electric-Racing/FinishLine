/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Construction, Work } from '@mui/icons-material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Folder, FormatListBulleted, FormatListNumbered, CoPresent } from '@mui/icons-material';
import Link from '@mui/material/Link';
import { Project, WorkPackage, wbsPipe } from 'shared';
import { datePipe, dollarsPipe, fullNamePipe, weeksPipe } from '../../../utils/pipes';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import WorkPackageSummary from './WorkPackageSummary';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const theme = useTheme();
  return (
    <Grid container display="flex" flexDirection="row" sx={{ mt: '10px' }}>
      <Grid item sm={12} md={6} sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            cursor: 'pointer',
            mb: 1
          }}
        >
          Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <Construction />
            <Typography sx={{ ml: 2, mr: 1, fontWeight: 'bold' }} display="inline" textAlign={'right'}>
              Project Lead:
            </Typography>
            <Typography sx={{ fontWeight: 'normal', display: 'inline' }} textAlign={'center'}>
              {fullNamePipe(project.projectLead)}
            </Typography>
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <ScheduleIcon />
            <Typography sx={{ ml: 2, mr: 1, fontWeight: 'bold' }} display="inline" textAlign={'right'}>
              Start Date:
            </Typography>
            <Typography sx={{ fontWeight: 'normal', display: 'inline' }} textAlign={'center'}>
              {datePipe(project.startDate) || 'n/a'}
            </Typography>
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <Work />
            <Typography sx={{ ml: 2, mr: 1, fontWeight: 'bold' }} display="inline" textAlign={'right'}>
              Project Manager:
            </Typography>
            <Typography sx={{ fontWeight: 'normal', display: 'inline' }}>{fullNamePipe(project.projectManager)}</Typography>
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <ScheduleIcon />
            <Typography sx={{ ml: 2, mr: 1, fontWeight: 'bold' }} display="inline" textAlign={'right'}>
              End Date:
            </Typography>
            <Typography sx={{ fontWeight: 'normal', display: 'inline' }}>{datePipe(project.endDate) || 'n/a'}</Typography>
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <AttachMoneyIcon />
            <Typography sx={{ ml: 2, mr: 1, fontWeight: 'bold' }} display="inline" textAlign={'right'}>
              Budget:
            </Typography>
            <Typography sx={{ fontWeight: 'normal', display: 'inline' }} textAlign={'center'}>
              {dollarsPipe(project.budget)}
            </Typography>
          </Grid>

          <Grid item display="flex" alignItems="center" xs={12} sm={6}>
            <ScheduleIcon />
            <Typography sx={{ ml: 2, mr: 1, fontWeight: 'bold' }} display="inline" textAlign={'right'}>
              Duration:
            </Typography>
            <Typography sx={{ fontWeight: 'normal', display: 'inline' }}>{weeksPipe(project.duration)}</Typography>
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
            <FormatListBulleted sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            <Link href={project.taskListLink!} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
              Task List
            </Link>
          </Grid>
          <Grid item xs={6} display="flex" alignItems="center">
            <CoPresent sx={{ fontSize: 22, color: theme.palette.text.primary }} />
            <Link href={project.slideDeckLink!} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
              Slide Deck
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
