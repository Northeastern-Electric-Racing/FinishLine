/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackage } from 'shared';
import { percentPipe, fullNamePipe, datePipe, weeksPipe } from '../../../utils/pipes';
import WbsStatus from '../../../components/WbsStatus';
import PageBlock from '../../../layouts/PageBlock';
import { Grid } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import WorkPackageStageChip from '../../../components/WorkPackageStageChip';
import { timelinePipe } from '../../../utils/pipes';

interface WorkPackageDetailsProps {
  workPackage: WorkPackage;
}

const WorkPackageDetails: React.FC<WorkPackageDetailsProps> = ({ workPackage }) => {
  return (
    <PageBlock
      title={'Work Package Details'}
      headerRight={
        <>
          <WorkPackageStageChip stage={workPackage.stage} />
          <WbsStatus status={workPackage.status} />
        </>
      }
    >
      <Grid container spacing={1}>
        <Grid item xs={4} md={4}>
          <DetailDisplay label="Lead" content={fullNamePipe(workPackage.projectLead)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Start Date" content={datePipe(workPackage.startDate)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Progress" content={percentPipe(workPackage.progress)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Manager" content={fullNamePipe(workPackage.projectManager)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="End Date" content={datePipe(workPackage.endDate)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Expected Progress" content={percentPipe(workPackage.expectedProgress)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Duration" content={weeksPipe(workPackage.duration)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Timeline Status" content={timelinePipe(workPackage.timelineStatus)} paddingRight={2} />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageDetails;
