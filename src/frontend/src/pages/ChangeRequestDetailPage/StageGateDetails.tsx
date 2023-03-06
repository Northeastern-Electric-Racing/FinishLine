/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Typography } from '@mui/material';
import { StageGateChangeRequest } from 'shared';
import { booleanPipe } from '../../utils/pipes';
import PageBlock from '../../layouts/PageBlock';

interface StageGateDetailsProps {
  cr: StageGateChangeRequest;
}

const StageGateDetails: React.FC<StageGateDetailsProps> = ({ cr }) => {
  return (
    <PageBlock title={'Stage Gate Change Request Details'}>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Typography sx={{ fontWeight: 'bold' }}>Confirm WP Completed</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography>{booleanPipe(cr.confirmDone)}</Typography>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default StageGateDetails;
