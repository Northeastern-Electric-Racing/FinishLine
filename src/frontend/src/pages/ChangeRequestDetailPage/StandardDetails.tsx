/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Typography } from '@mui/material';
import { ChangeRequestExplanation, StandardChangeRequest } from 'shared';
import PageBlock from '../../layouts/PageBlock';

interface StandardDetailsProps {
  cr: StandardChangeRequest;
}

const StandardDetails: React.FC<StandardDetailsProps> = ({ cr }: StandardDetailsProps) => {
  return (
    <PageBlock title={'Standard Change Request Details'}>
      <Grid container spacing={1}>
        <Grid item xs={2}>
          <Typography sx={{ maxWidth: '140px' }}>
            <b>What</b>
          </Typography>
        </Grid>
        <Grid item xs={10}>
          {cr.what}
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ maxWidth: '140px' }}>
            <b>Why</b>
          </Typography>
        </Grid>
        <Grid item xs={10}>
          {cr.why.map((ele: ChangeRequestExplanation, idx: number) => (
            <Grid item xs={10} key={idx}>
              <Typography sx={{ maxWidth: '140px' }}>
                <b>{ele.type}</b>
              </Typography>
              <Grid item xs={10}>
                {ele.explain}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default StandardDetails;
