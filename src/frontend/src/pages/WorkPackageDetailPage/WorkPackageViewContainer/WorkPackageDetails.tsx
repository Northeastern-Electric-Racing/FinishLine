/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
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
        <Grid item xs={2} md={2}>
          <Typography>Project Lead: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>{fullNamePipe(workPackage.projectLead)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Project Manager: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>{fullNamePipe(workPackage.projectManager)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Duration: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>{weeksPipe(workPackage.duration)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Start Date: </Typography>
        </Grid>
        <Grid item xs={3} md={2}>
          <Typography>{datePipe(workPackage.startDate)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>End Date: </Typography>
        </Grid>
        <Grid item xs={5} md={2}>
          <Typography>{datePipe(workPackage.endDate)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Progress: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>{percentPipe(workPackage.progress)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Expected Progress: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>{percentPipe(workPackage.expectedProgress)}</Typography>
        </Grid>

        <Grid item xs={2} md={2}>
          <Typography>Timeline Status: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>{workPackage.timelineStatus}</Typography>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageDetails;
