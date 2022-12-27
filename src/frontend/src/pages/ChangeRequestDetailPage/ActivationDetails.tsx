/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ActivationChangeRequest } from 'shared';
import { booleanPipe, datePipe, fullNamePipe } from '../../utils/Pipes';
import PageBlock from '../../layouts/PageBlock';
import { Grid, Typography } from '@mui/material';

interface ActivationDetailsProps {
  cr: ActivationChangeRequest;
}

const ActivationDetails: React.FC<ActivationDetailsProps> = ({ cr }) => {
  return (
    <PageBlock title={'Activation Change Request Details'}>
      <Grid container>
        <Grid item xs={6} md={2}>
          <Typography>
            <b>Project Lead </b>
          </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          {fullNamePipe(cr.projectLead)}
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography>
            <b>Start Date </b>
          </Typography>
        </Grid>
        <Grid item xs={6} md={6}>
          {datePipe(cr.startDate)}
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography>
            <b>Project Manager </b>
          </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          {fullNamePipe(cr.projectManager)}
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography>
            <b>Confirm WP Details </b>
          </Typography>
        </Grid>
        <Grid item xs={6} md={6}>
          {booleanPipe(cr.confirmDetails)}
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ActivationDetails;
