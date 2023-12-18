/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ActivationChangeRequest } from 'shared';
import { booleanPipe, datePipe, fullNamePipe } from '../../utils/pipes';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

interface ActivationDetailsProps {
  cr: ActivationChangeRequest;
}

const ActivationDetails: React.FC<ActivationDetailsProps> = ({ cr }) => {
  return (
    <h1> 
      <Typography 
      sx={{ fontWeight: 'bold', fontSize: 30, fontFamily: 'oswald,sans-serif'}}>Activation Change Request Details </Typography> 
      <Grid container>
        <Grid item xs={4} md={2}>
          <Typography sx={{ fontWeight: 'bold' }}>Project Lead: </Typography>
        </Grid>
        <Grid item xs={2} md={2}>
          <Typography>{fullNamePipe(cr.projectLead)}</Typography>
        </Grid>
        <Grid item xs={8}>
        </Grid>
        <Grid item xs={4} md={2}>
          <Typography sx={{ fontWeight: 'bold' }}>Start Date: </Typography>
        </Grid>
        <Grid item xs={4} md={2}>
          <Typography>{datePipe(cr.startDate)}</Typography>
        </Grid>
        <Grid item xs={8}>
        </Grid>
        <Grid item xs={4} md={2}>
          <Typography sx={{ fontWeight: 'bold' }}>Project Manager: </Typography>
        </Grid>
        <Grid item xs={4} md={2}>
          <Typography>{fullNamePipe(cr.projectManager)}</Typography>
        </Grid>
        <Grid item xs={8}>
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ fontWeight: 'bold' }}>Confirm WP Details: </Typography>
        </Grid>
        <Grid item xs={1}>
          <Typography>{booleanPipe(cr.confirmDetails)}</Typography>
        </Grid>
      </Grid>
    </h1>
  );
};

export default ActivationDetails;
