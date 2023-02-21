/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackage, WorkPackageStage } from 'shared';
import { percentPipe, fullNamePipe, datePipe, weeksPipe } from '../../../utils/pipes';
import WbsStatus from '../../../components/WbsStatus';
import PageBlock from '../../../layouts/PageBlock';
import { Chip, Grid } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';

interface WorkPackageDetailsProps {
  workPackage: WorkPackage;
}

const workPackageStageLabelMap: Record<WorkPackageStage, string> = {
  [WorkPackageStage.Research]: 'Research',
  [WorkPackageStage.Design]: 'Design',
  [WorkPackageStage.Manufacturing]: 'Manufacturing',
  [WorkPackageStage.Integration]: 'Integration'
};

const WorkPackageDetails: React.FC<WorkPackageDetailsProps> = ({ workPackage }) => {
  console.log(workPackage);

  return (
    <PageBlock
      title={'Work Package Details'}
      headerRight={
        <>
          {workPackage.stage ? (
            <Chip size="small" label={workPackageStageLabelMap[workPackage.stage]} sx={{ fontSize: 14 }} />
          ) : null}
          <WbsStatus status={workPackage.status} />
        </>
      }
    >
      <Grid container spacing={1}>
        <Grid item xs={4} md={4}>
          <DetailDisplay label="Project Lead" content={fullNamePipe(workPackage.projectLead)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Start Date" content={datePipe(workPackage.startDate)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Progress" content={percentPipe(workPackage.progress)} paddingRight={2} />
        </Grid>

        <Grid item xs={4} md={4}>
          <DetailDisplay label="Project Manager" content={fullNamePipe(workPackage.projectManager)} paddingRight={2} />
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
          <DetailDisplay label="Timeline Status" content={workPackage.timelineStatus} paddingRight={2} />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageDetails;
