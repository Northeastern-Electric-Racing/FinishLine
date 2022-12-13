/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Typography } from '@mui/material';
import { StageGateChangeRequest } from 'shared';
import { booleanPipe, dollarsPipe } from '../../utils/Pipes';
import PageBlock from '../../layouts/PageBlock';

interface StageGateDetailsProps {
  cr: StageGateChangeRequest;
}

const StageGateDetails: React.FC<StageGateDetailsProps> = ({ cr }) => {
  return (
    <PageBlock title={'Stage Gate Change Request Details'}>
      <Grid container spacing={1}>
        <Grid item xs={2}>
          <Typography sx={{ maxWidth: '140px' }}>
            <b>Leftover Budget</b>
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography sx={{ maxWidth: '140px' }}>{dollarsPipe(cr.leftoverBudget)}</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ maxWidth: '140px' }}>
            <b>Confirm WP Completed</b>
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography sx={{ maxWidth: '140px' }}>{booleanPipe(cr.confirmDone)}</Typography>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default StageGateDetails;
