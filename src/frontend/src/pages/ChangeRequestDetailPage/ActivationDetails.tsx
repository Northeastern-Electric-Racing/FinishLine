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
        <Grid item xs={12} md={4}>
          <b>Project Lead: </b> {fullNamePipe(cr.projectLead)}
        </Grid>
        <Grid item xs={12} md={8}>
          <b>Start Date: </b> {datePipe(cr.startDate)}
        </Grid>
        <Grid item xs={12} md={4}>
          <b>Project Manager: </b> {fullNamePipe(cr.projectManager)}
        </Grid>
        <Grid item xs={12} md={8}>
          <b>Confirm WP Details: </b> {booleanPipe(cr.confirmDetails)}
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ActivationDetails;
