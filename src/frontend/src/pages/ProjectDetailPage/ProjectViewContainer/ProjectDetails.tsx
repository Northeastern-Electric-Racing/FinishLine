/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Construction, Work } from '@mui/icons-material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Project, WorkPackage, wbsPipe } from 'shared';
import { datePipe, dollarsPipe, fullNamePipe, weeksPipe } from '../../../utils/pipes';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import WorkPackageSummary from './WorkPackageSummary';
import DetailDisplay from '../../../components/DetailDisplay';
import LinkView from '../../../components/Link/LinkView';
import GroupIcon from '@mui/icons-material/Group';
import { getProjectTeamsName } from '../../../utils/gantt.utils';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
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
            <GroupIcon sx={{ mr: 2 }} />
            <DetailDisplay
              label={project.teams.length > 1 ? 'Teams' : 'Team'}
              content={getProjectTeamsName(project)}
              paddingRight={1}
            />
          </Grid>
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
          {project.links.map((link) => (
            <Grid item xs={4} key={link.linkId}>
              <LinkView link={link} />
            </Grid>
          ))}
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
