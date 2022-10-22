/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ActivationChangeRequest } from 'shared';
import { booleanPipe, datePipe, fullNamePipe } from '../../utils/Pipes';
import PageBlock from '../../layouts/PageBlock';
import { Grid } from '@mui/material';

interface ActivationDetailsProps {
  cr: ActivationChangeRequest;
}

const ActivationDetails: React.FC<ActivationDetailsProps> = ({ cr }) => {
  return (
    <PageBlock title={'Activation Change Request Details'}>
      <Grid container>
        <Grid item xs={6} md={2}>
          <b>Project Lead </b>
        </Grid>
        <Grid item xs={6} md={2}>
          {fullNamePipe(cr.projectLead)}
        </Grid>
        <Grid item xs={6} md={2}>
          <b>Start Date </b>
        </Grid>
        <Grid item xs={6} md={6}>
          {datePipe(cr.startDate)}
        </Grid>
        <Grid item xs={6} md={2}>
          <b>Project Manager </b>
        </Grid>
        <Grid item xs={6} md={2}>
          {fullNamePipe(cr.projectManager)}
        </Grid>
        <Grid item xs={6} md={2}>
          <b>Confirm WP Details </b>
        </Grid>
        <Grid item xs={6} md={6}>
          {booleanPipe(cr.confirmDetails)}
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ActivationDetails;
