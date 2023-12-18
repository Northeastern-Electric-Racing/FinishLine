/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ActivationChangeRequest } from 'shared';
import { booleanPipe, datePipe, fullNamePipe } from '../../utils/pipes';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import InfoBlock from '../../components/InfoBlock';

interface ActivationDetailsProps {
  cr: ActivationChangeRequest;
}

const ActivationDetails: React.FC<ActivationDetailsProps> = ({ cr }) => {
  return (
    <InfoBlock title={'Activation Change Request Details'}>
      <Grid container>
        <Grid item xs={6} md={2}>
          <Typography sx={{ fontWeight: 'bold' }}>Project Lead </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography>{fullNamePipe(cr.projectLead)}</Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography sx={{ fontWeight: 'bold' }}>Start Date </Typography>
        </Grid>
        <Grid item xs={6} md={6}>
          <Typography>{datePipe(cr.startDate)}</Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography sx={{ fontWeight: 'bold' }}>Project Manager </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography>{fullNamePipe(cr.projectManager)}</Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography sx={{ fontWeight: 'bold' }}>Confirm WP Details </Typography>
        </Grid>
        <Grid item xs={6} md={6}>
          <Typography>{booleanPipe(cr.confirmDetails)}</Typography>
        </Grid>
      </Grid>
    </InfoBlock>
  );
};

export default ActivationDetails;
