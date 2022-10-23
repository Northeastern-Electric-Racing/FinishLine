/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackage } from 'shared';
import { percentPipe, fullNamePipe, datePipe, weeksPipe } from '../../../utils/Pipes';
import WbsStatus from '../../../components/WbsStatus';
import PageBlock from '../../../layouts/PageBlock';
import { Grid, Typography } from '@mui/material';

interface WorkPackageDetailsProps {
  workPackage: WorkPackage;
}

const WorkPackageDetails: React.FC<WorkPackageDetailsProps> = ({ workPackage }) => {
  return (
    <PageBlock title={'Work Package Details'} headerRight={<WbsStatus status={workPackage.status} />}>
      <Grid container spacing={1}>
        <Grid item xs={1}>
          <Typography>Project Lead: </Typography>
        </Grid>
        <Grid item xs={1}>
          {fullNamePipe(workPackage.projectLead)}
        </Grid>

        <Grid item xs={2}>
          <Typography>Project Manager: </Typography>
        </Grid>
        <Grid item xs={1}>
          {fullNamePipe(workPackage.projectManager)}
        </Grid>

        <Grid item xs={1}>
          <Typography>Duration: </Typography>
        </Grid>
        <Grid item xs={1}>
          {weeksPipe(workPackage.duration)}
        </Grid>

        <Grid item xs={1}>
          <Typography>Start Date: </Typography>
        </Grid>
        <Grid item xs={1}>
          {datePipe(workPackage.startDate)}
        </Grid>

        <Grid item xs={1}>
          <Typography>End Date: </Typography>
        </Grid>
        <Grid item xs={2}>
          {datePipe(workPackage.endDate)}
        </Grid>

        <Grid item xs={1}>
          <Typography>Progress: </Typography>
        </Grid>
        <Grid item xs={1}>
          {percentPipe(workPackage.progress)}
        </Grid>

        <Grid item xs={2}>
          <Typography>Expected Progress: </Typography>
        </Grid>
        <Grid item xs={1}>
          {percentPipe(workPackage.expectedProgress)}
        </Grid>

        <Grid item xs={2}>
          <Typography>Timeline Status: </Typography>
        </Grid>
        <Grid item xs={1}>
          {workPackage.timelineStatus}
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageDetails;
