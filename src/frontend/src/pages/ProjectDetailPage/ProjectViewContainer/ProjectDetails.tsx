/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Construction, Work } from '@mui/icons-material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Project, WorkPackage, wbsPipe } from 'shared';
import { datePipe, dollarsPipe, fullNamePipe, weeksPipe } from '../../../utils/pipes';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import WorkPackageSummary from './WorkPackageSummary';
import DetailDisplay from '../../../components/DetailDisplay';
import LinkView from '../../../components/Link/LinkView';
import GroupIcon from '@mui/icons-material/Group';
import { useGetReimbursementRequestProjectData } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PieChart from '../../FinancePage/FinanceComponents/PieChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export const getProjectTeamsName = (project: Project): string => {
  return project.teams.map((team) => team.teamName).join(', ');
};

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const { id: projectId, startDate, endDate } = project;

  const {
    data: rrData,
    isLoading: rrDataIsLoading,
    isError: rrDataIsError,
    error: rrDataError
  } = useGetReimbursementRequestProjectData({ projectId, startDate, endDate });

  if (rrDataIsError) {
    return <ErrorPage error={rrDataError} />;
  }

  if (!rrData || rrDataIsLoading) {
    return <LoadingIndicator />;
  }

  const isEmpty =
    rrData.pendingLeadership === 0 &&
    rrData.pendingFinance === 0 &&
    rrData.submittedToSabo === 0 &&
    rrData.reimbursed === 0 &&
    rrData.available === 0;

  if (isEmpty) {
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
              <DetailDisplay label="Project Lead" content={fullNamePipe(project.lead)} paddingRight={1} />
            </Grid>
            <Grid item display="flex" alignItems="center" xs={12} sm={6}>
              <ScheduleIcon sx={{ mr: 2 }} />
              <DetailDisplay label="Start Date" content={datePipe(project.startDate) || 'n/a'} paddingRight={1} />
            </Grid>
            <Grid item display="flex" alignItems="center" xs={12} sm={6}>
              <Work sx={{ mr: 2 }} />
              <DetailDisplay label="Project Manager" content={fullNamePipe(project.manager)} paddingRight={1} />
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
  }

  return (
    <Grid container spacing={2} sx={{ mt: '10px' }}>
      <Grid item xs={12} md={3} sx={{ mb: 2 }}>
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
          <Grid item display="flex" alignItems="center" xs={12}>
            <GroupIcon sx={{ mr: 1 }} />
            <DetailDisplay
              label={project.teams.length > 1 ? 'Teams' : 'Team'}
              content={getProjectTeamsName(project)}
              paddingRight={1}
            />
          </Grid>
          <Grid item display="flex" alignItems="center" xs={12}>
            <Construction sx={{ mr: 1 }} />
            <DetailDisplay label="Project Lead" content={fullNamePipe(project.lead)} paddingRight={1} />
          </Grid>
          <Grid item display="flex" alignItems="center" xs={12}>
            <Work sx={{ mr: 1 }} />
            <DetailDisplay label="Project Manager" content={fullNamePipe(project.manager)} paddingRight={1} />
          </Grid>
          <Grid item display="flex" alignItems="center" xs={12}>
            <ScheduleIcon sx={{ mr: 1 }} />
            <DetailDisplay label="Start Date" content={datePipe(project.startDate) || 'n/a'} paddingRight={1} />
          </Grid>
          <Grid item display="flex" alignItems="center" xs={12}>
            <ScheduleIcon sx={{ mr: 1 }} />
            <DetailDisplay label="End Date" content={datePipe(project.endDate) || 'n/a'} paddingRight={1} />
          </Grid>
          <Grid item display="flex" alignItems="center" xs={12}>
            <ScheduleIcon sx={{ mr: 1 }} />
            <DetailDisplay label="Duration" content={weeksPipe(project.duration)} paddingRight={1} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={3} sx={{ mb: 7, mr: 29 }}>
        <Typography
          variant="h5"
          sx={{
            cursor: 'pointer',
            mb: -4
          }}
        >
          Budget
        </Typography>
        <PieChart
          totalBalance={rrData.totalBudget}
          pendingLeadership={rrData.pendingLeadership}
          pendingFinance={rrData.pendingFinance}
          submittedToSABO={rrData.submittedToSabo}
          reimbursed={rrData.reimbursed}
          available={rrData.available}
        />
      </Grid>
      <Grid item xs={12} md={3} sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="h5"
              sx={{
                cursor: 'pointer',
                mb: 1
              }}
            >
              Summary
            </Typography>
            <Typography>{project.summary}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="h5"
              sx={{
                cursor: 'pointer',
                mb: 1
              }}
            >
              Links
            </Typography>
            <Grid container spacing={1}>
              {project.links.map((link) => (
                <Grid item xs={12} key={link.linkId}>
                  <LinkView link={link} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            cursor: 'pointer'
          }}
        >
          Work Packages
        </Typography>
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
