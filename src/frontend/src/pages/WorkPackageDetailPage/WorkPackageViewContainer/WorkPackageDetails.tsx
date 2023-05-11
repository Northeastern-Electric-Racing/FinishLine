/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackage, wbsPipe } from 'shared';
import { percentPipe, fullNamePipe, datePipe, weeksPipe } from '../../../utils/pipes';
import WbsStatus from '../../../components/WbsStatus';
import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import WorkPackageStageChip from '../../../components/WorkPackageStageChip';
import { timelinePipe } from '../../../utils/pipes';
import { Construction, Work } from '@mui/icons-material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import DoneAllIcon from '@mui/icons-material/DoneAll';

interface WorkPackageDetailsProps {
  workPackage: WorkPackage;
}

const WorkPackageDetails: React.FC<WorkPackageDetailsProps> = ({ workPackage }) => {
  return (
    <>
      <Box sx={{ mb: 1 }}>
        <Grid container spacing={2}>
          <Grid item display="flex" alignItems="center" xs={6} sm={3}>
            <Typography
              variant="h5"
              sx={{
                mb: 1,
                cursor: 'pointer'
              }}
            >
              Work Package Details
            </Typography>
          </Grid>
          <Grid item display="flex" alignItems="center" xs={6} sm={3}>
            <Box>
              {workPackage.stage ? <WorkPackageStageChip stage={workPackage.stage} /> : null}
              <WbsStatus status={workPackage.status} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        <Grid item display="flex" alignItems="center" xs={6} sm={3}>
          <Construction sx={{ mr: 2 }} />
          <DetailDisplay label="Lead" content={fullNamePipe(workPackage.projectLead)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={6} sm={3}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Start Date" content={datePipe(workPackage.startDate)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={6} sm={3}>
          <StackedLineChartIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Progress" content={percentPipe(workPackage.progress)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={6} sm={3}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Duration" content={weeksPipe(workPackage.duration)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={6} sm={3}>
          <Work sx={{ mr: 2 }} />
          <DetailDisplay label="Manager" content={fullNamePipe(workPackage.projectManager)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={6} sm={3}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="End Date" content={datePipe(workPackage.endDate)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={6} sm={3}>
          <DoneAllIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Expected Progress" content={percentPipe(workPackage.expectedProgress)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={6} sm={3}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Timeline Status" content={timelinePipe(workPackage.timelineStatus)} paddingRight={1} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 1,
            cursor: 'pointer'
          }}
        >
          Blocked By
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" divider={<Divider orientation="vertical" flexItem />} spacing={2}>
        {workPackage.blockedBy.length === 0 ? (
          <Typography>No Blockers</Typography>
        ) : (
          workPackage.blockedBy.map((dep, idx) => (
            <Typography sx={{ fontWeight: 'bold' }} key={idx}>
              {wbsPipe(dep)}
            </Typography>
          ))
        )}
      </Stack>
    </>
  );
};

export default WorkPackageDetails;
