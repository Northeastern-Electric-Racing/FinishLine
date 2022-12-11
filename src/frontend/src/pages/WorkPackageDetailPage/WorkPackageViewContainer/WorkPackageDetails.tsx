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
        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Project Lead:{' '}
          </Typography>
          <Typography display="inline">{fullNamePipe(workPackage.projectLead)}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Start Date:{' '}
          </Typography>
          <Typography display="inline">{datePipe(workPackage.startDate)}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Duration:{' '}
          </Typography>
          <Typography display="inline">{weeksPipe(workPackage.duration)}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Project Manager:{' '}
          </Typography>
          <Typography display="inline">{fullNamePipe(workPackage.projectManager)}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            End Date:{' '}
          </Typography>
          <Typography display="inline">{datePipe(workPackage.endDate)}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Progress:{' '}
          </Typography>
          <Typography display="inline">{percentPipe(workPackage.progress)}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Expected Progress:{' '}
          </Typography>
          <Typography display="inline">{percentPipe(workPackage.expectedProgress)}</Typography>
        </Grid>

        <Grid item xs={4} md={4}>
          <Typography sx={{ fontWeight: 'bold', paddingRight: 2 }} display="inline">
            Timeline Status:{' '}
          </Typography>
          <Typography display="inline">{workPackage.timelineStatus}</Typography>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default WorkPackageDetails;
