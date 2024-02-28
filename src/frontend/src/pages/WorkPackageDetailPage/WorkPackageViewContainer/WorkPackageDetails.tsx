/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest, WorkPackage, wbsPipe } from 'shared';
import { percentPipe, fullNamePipe, datePipe, weeksPipe } from '../../../utils/pipes';
import WbsStatus from '../../../components/WbsStatus';
import { Box, Divider, Grid, Link, Stack, Typography, useTheme } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import WorkPackageStageChip from '../../../components/WorkPackageStageChip';
import { timelinePipe } from '../../../utils/pipes';
import { Construction, Work } from '@mui/icons-material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
//import ChangeRequestsOverview from '../../ChangeRequestsPage/ChangeRequestsOverview';
import ChangeRequestDetailCard from '../../../components/ChangeRequestDetailCard';
import { useAllChangeRequests } from '../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
//import { useCurrentUser } from '../../../hooks/users.hooks';
interface WorkPackageDetailsProps {
  workPackage: WorkPackage;
  dependencies: WorkPackage[];
}

const WorkPackageDetails: React.FC<WorkPackageDetailsProps> = ({ workPackage, dependencies }) => {
  const theme = useTheme();
  //const user = useCurrentUser();
  const changeRequests = useAllChangeRequests();
  //const currentDate = new Date();
  const crIsLoading = changeRequests.isLoading;
  if (crIsLoading && !changeRequests) {
    return <LoadingIndicator />;
  }
  const crUnreviewed: ChangeRequest[] = [];
  const crApproved: ChangeRequest[] = [];
  const displayCRCards = (crList: ChangeRequest[]) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'auto',
        justifyContent: 'flex-start',
        '&::-webkit-scrollbar': {
          height: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        }
      }}
    >
      {crList.map((cr: ChangeRequest) => (
        <ChangeRequestDetailCard changeRequest={cr}></ChangeRequestDetailCard>
      ))}
    </Box>
  );

  const renderChangeRequests = (title: string, crList: ChangeRequest[], emptyMessage: string) => {
    return (
      <>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {crList.length > 0 ? (
          <Grid container>{displayCRCards(crList)}</Grid>
        ) : (
          <Typography gutterBottom>{emptyMessage}</Typography>
        )}
      </>
    );
  };
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', mb: 2, mt: 1 }}>
        <Typography sx={{ mr: '4px' }} variant="h5">
          Work Package Details
        </Typography>
        {workPackage.stage && <WorkPackageStageChip stage={workPackage.stage} />}
        <WbsStatus status={workPackage.status} />
      </Box>

      <Grid container spacing={2}>
        <Grid item display="flex" alignItems="center" xs={12} sm={6} md={3}>
          <Construction sx={{ mr: 2 }} />
          <DetailDisplay label="Lead" content={fullNamePipe(workPackage.projectLead)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6} md={3}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Start Date" content={datePipe(workPackage.startDate)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6} md={3}>
          <StackedLineChartIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Progress" content={percentPipe(workPackage.progress)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6} md={3}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Duration" content={weeksPipe(workPackage.duration)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6} md={3}>
          <Work sx={{ mr: 2 }} />
          <DetailDisplay label="Manager" content={fullNamePipe(workPackage.projectManager)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6} md={3}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="End Date" content={datePipe(workPackage.endDate)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6} md={3}>
          <DoneAllIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Expected Progress" content={percentPipe(workPackage.expectedProgress)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6} md={3}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Timeline Status" content={timelinePipe(workPackage.timelineStatus)} paddingRight={1} />
        </Grid>
      </Grid>

      {renderChangeRequests('My Un-reviewed Change Requests', crUnreviewed, 'No un-reviewed change requests')}
      {renderChangeRequests('My Recently Approved Change Requests', crApproved, 'No recently approved change requests')}

      <Typography
        variant="h5"
        sx={{
          mb: 1,
          mt: 5
        }}
      >
        Blocked By
      </Typography>

      <Stack direction="row" alignItems="center" divider={<Divider orientation="vertical" flexItem />} spacing={2}>
        {dependencies.length === 0 ? (
          <Typography>No Blockers</Typography>
        ) : (
          dependencies.map((dep, idx) => (
            <Link
              key={`${dep.name}-${idx}`}
              component={RouterLink}
              to={routes.PROJECTS + `/${wbsPipe(dep.wbsNum)}`}
              fontWeight="bold"
            >
              {`${wbsPipe(dep.wbsNum)} - ${dep.name}`}
            </Link>
          ))
        )}
      </Stack>
    </>
  );
};

export default WorkPackageDetails;
