/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackage } from 'shared';
import { percentPipe, fullNamePipe, datePipe, weeksPipe } from '../../../utils/pipes';
import WbsStatus from '../../../components/WbsStatus';
import PageBlock from '../../../layouts/PageBlock';
import { Grid } from '@mui/material';
import { formatKeyValueSpaced } from '../../../styling/keyValueSameLine';

interface WorkPackageDetailsProps {
  workPackage: WorkPackage;
}

const WorkPackageDetails: React.FC<WorkPackageDetailsProps> = ({ workPackage }) => {
  const paddingRight = 2;
  return (
    <PageBlock title={'Work Package Details'} headerRight={<WbsStatus status={workPackage.status} />}>
      <Grid container spacing={1}>
        <Grid item xs={4} md={4}>
          {formatKeyValueSpaced('Project Lead', fullNamePipe(workPackage.projectLead), paddingRight)}
        </Grid>

        <Grid item xs={4} md={4}>
          {formatKeyValueSpaced('Start Date', datePipe(workPackage.startDate), paddingRight)}
        </Grid>

        <Grid item xs={4} md={4}>
          {formatKeyValueSpaced('Progress', percentPipe(workPackage.progress), paddingRight)}
        </Grid>

        <Grid item xs={4} md={4}>
          {formatKeyValueSpaced('Project Manager', fullNamePipe(workPackage.projectManager), paddingRight)}
        </Grid>

        <Grid item xs={4} md={4}>
          {formatKeyValueSpaced('End Date', datePipe(workPackage.endDate), paddingRight)}
        </Grid>

        <Grid item xs={4} md={4}>
          {formatKeyValueSpaced('Expected Progress', percentPipe(workPackage.expectedProgress), paddingRight)}
        </Grid>

        <Grid item xs={4} md={4}>
          {formatKeyValueSpaced('Duration', weeksPipe(workPackage.duration), paddingRight)}
        </Grid>

        <Grid item xs={4} md={4}>
          {formatKeyValueSpaced('Timeline Status', workPackage.timelineStatus, paddingRight)}
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageDetails;
