/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackage } from 'shared';
import { percentPipe, fullNamePipe, datePipe, weeksPipe } from '../../../utils/pipes';
import WbsStatus from '../../../components/WbsStatus';
import { Box, Grid, Typography } from '@mui/material';
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
    <Grid item sm={12} md={6} sx={{ mb: 2 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 1,
          cursor: 'pointer'
        }}
      >
        Work Package Details
      </Typography>

      <Grid container spacing={2}>
        <Grid item display="flex" alignItems="center" xs={12} sm={6}>
          <Construction sx={{ mr: 2 }} />
          <DetailDisplay label="Lead" content={fullNamePipe(workPackage.projectLead)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Start Date" content={datePipe(workPackage.startDate)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6}>
          <StackedLineChartIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Progress" content={percentPipe(workPackage.progress)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6}>
          <Work sx={{ mr: 2 }} />
          <DetailDisplay label="Manager" content={fullNamePipe(workPackage.projectManager)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="End Date" content={datePipe(workPackage.endDate)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6}>
          <DoneAllIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Expected Progress" content={percentPipe(workPackage.expectedProgress)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Duration" content={weeksPipe(workPackage.duration)} paddingRight={1} />
        </Grid>

        <Grid item display="flex" alignItems="center" xs={12} sm={6}>
          <ScheduleIcon sx={{ mr: 2 }} />
          <DetailDisplay label="Timeline Status" content={timelinePipe(workPackage.timelineStatus)} paddingRight={1} />
        </Grid>

        <Box>
          {workPackage.stage ? <WorkPackageStageChip stage={workPackage.stage} /> : null}
          <WbsStatus status={workPackage.status} />
        </Box>

      </Grid>
    </Grid>
  );
};

export default WorkPackageDetails;
