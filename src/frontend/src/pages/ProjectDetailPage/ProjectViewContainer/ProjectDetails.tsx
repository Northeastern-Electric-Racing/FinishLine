/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Construction, Work } from '@mui/icons-material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Project, ProjectPreview, WorkPackage, wbsPipe } from 'shared';
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
import WarningBanner from '../../../components/WarningBanner';
import { Box } from '@mui/system';



export const getProjectTeamsName = (project: ProjectPreview): string => {
  return project.teams.map((team) => team.teamName).join(', ');
};

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const { id: projectId } = project;

  const {
    data: rrData,
    isLoading: rrDataIsLoading,
    isError: rrDataIsError,
    error: rrDataError
  } = useGetReimbursementRequestProjectData({ projectId });

  if (rrDataIsError) {
    return <ErrorPage error={rrDataError} />;
  }

  if (!rrData || rrDataIsLoading) {
    return <LoadingIndicator />;
  }

  const emptyRRData =
    rrData.pendingLeadership === 0 &&
    rrData.pendingFinance === 0 &&
    rrData.submittedToSabo === 0 &&
    rrData.reimbursed === 0 &&
    rrData.available === 0;

  const amountUsed = rrData.pendingFinance + rrData.pendingLeadership + rrData.submittedToSabo + rrData.reimbursed;

  const overBudget = project.budget < amountUsed;

  const amountOver = amountUsed - project.budget;

  const detailGridSize = emptyRRData ? { sm: 12, md: 6 } : { xs: 12, md: 3 };
  const summaryGridSize = emptyRRData ? { sm: 12, md: 6 } : { xs: 12, md: 3 };

  const detailItems = [
    {
      icon: <GroupIcon sx={{ mr: emptyRRData ? 2 : 1 }} />,
      label: project.teams.length > 1 ? 'Teams' : 'Team',
      content: getProjectTeamsName(project)
    },
    {
      icon: <Construction sx={{ mr: emptyRRData ? 2 : 1 }} />,
      label: 'Project Lead',
      content: fullNamePipe(project.lead)
    },
    {
      icon: <Work sx={{ mr: emptyRRData ? 2 : 1 }} />,
      label: 'Project Manager',
      content: fullNamePipe(project.manager)
    },
    {
      icon: <ScheduleIcon sx={{ mr: emptyRRData ? 2 : 1 }} />,
      label: 'Start Date',
      content: datePipe(project.startDate) || 'n/a'
    },
    {
      icon: <ScheduleIcon sx={{ mr: emptyRRData ? 2 : 1 }} />,
      label: 'Duration',
      content: weeksPipe(project.duration)
    },
    {
      icon: <ScheduleIcon sx={{ mr: emptyRRData ? 2 : 1 }} />,
      label: 'End Date',
      content: datePipe(project.endDate) || 'n/a'
    },
    ...(emptyRRData
      ? [
          {
            icon: <AttachMoneyIcon sx={{ mr: 2 }} />,
            label: 'Budget',
            content: dollarsPipe(project.budget)
          }
        ]
      : [])
  ];

  return (
    <Grid container spacing={2} sx={{ mt: '10px' }}>
      <Grid item {...detailGridSize} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ cursor: 'pointer', mb: 1 }}>
          Details
        </Typography>
        <Grid container spacing={2}>
          {detailItems.map((item, index) => (
            <Grid item display="flex" alignItems="center" xs={12} sm={emptyRRData ? 6 : 12} key={index}>
              {item.icon}
              <DetailDisplay label={item.label} content={item.content} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      {!emptyRRData && (
        <Grid item xs={12} md={4} sx={{ mr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ cursor: 'pointer' }}>
              Budget
            </Typography>
            {overBudget && <WarningBanner amount={amountOver} />}
          </Box>
          <PieChart
            totalBalance={rrData.totalBudget}
            pendingLeadership={rrData.pendingLeadership}
            pendingFinance={rrData.pendingFinance}
            submittedToSABO={rrData.submittedToSabo}
            reimbursed={rrData.reimbursed}
            available={rrData.available}
          />
        </Grid>
      )}
      <Grid item {...summaryGridSize} sx={{ mb: emptyRRData ? 2 : 7 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ cursor: 'pointer', mb: 1 }}>
              Summary
            </Typography>
            <Typography>{project.summary}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ cursor: 'pointer', mb: 1 }}>
              Links
            </Typography>
            <Grid container spacing={1}>
              {project.links.map((link) => (
                <Grid item xs={emptyRRData ? 4 : 12} key={link.linkId}>
                  <LinkView link={link} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ mb: 2, cursor: 'pointer' }}>
          Work Packages
        </Typography>
        {project.workPackages.map((ele) => (
          <Grid item xs={12} key={wbsPipe(ele.wbsNum)} sx={{ mb: 0.5 }}>
            <WorkPackageSummary workPackage={ele} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default ProjectDetails;
