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
import { DetailDisplayProps } from '../../../components/DetailDisplay';

const WorkPackageDetailsDetailDisplay: React.FC<DetailDisplayProps> = ({ label, content }) => {
  return <DetailDisplay label={label} content={content} paddingRight={2}></DetailDisplay>;
};

interface WorkPackageDetailsProps {
  workPackage: WorkPackage;
}

const WorkPackageDetails: React.FC<WorkPackageDetailsProps> = ({ workPackage }) => {
  return (
    <PageBlock title={'Work Package Details'} headerRight={<WbsStatus status={workPackage.status} />}>
      <Grid container spacing={1}>
        <Grid item xs={4} md={4}>
          <WorkPackageDetailsDetailDisplay
            label="Project Lead"
            content={fullNamePipe(workPackage.projectLead)}
          ></WorkPackageDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <WorkPackageDetailsDetailDisplay
            label="Start Date"
            content={datePipe(workPackage.startDate)}
          ></WorkPackageDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <WorkPackageDetailsDetailDisplay
            label="Progress"
            content={percentPipe(workPackage.progress)}
          ></WorkPackageDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <WorkPackageDetailsDetailDisplay
            label="Project Manager"
            content={fullNamePipe(workPackage.projectManager)}
          ></WorkPackageDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <WorkPackageDetailsDetailDisplay
            label="End Date"
            content={datePipe(workPackage.endDate)}
          ></WorkPackageDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <WorkPackageDetailsDetailDisplay
            label="Expected Progress"
            content={percentPipe(workPackage.expectedProgress)}
          ></WorkPackageDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <WorkPackageDetailsDetailDisplay
            label="Duration"
            content={weeksPipe(workPackage.duration)}
          ></WorkPackageDetailsDetailDisplay>
        </Grid>

        <Grid item xs={4} md={4}>
          <WorkPackageDetailsDetailDisplay
            label="Timeline Status"
            content={workPackage.timelineStatus}
          ></WorkPackageDetailsDetailDisplay>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageDetails;
