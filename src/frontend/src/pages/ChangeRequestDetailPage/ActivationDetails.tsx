/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ActivationChangeRequest } from 'shared';
import { datePipe, fullNamePipe } from '../../utils/pipes';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import InfoBlock from '../../components/InfoBlock';

interface ActivationDetailsProps {
  cr: ActivationChangeRequest;
}

const ActivationDetails: React.FC<ActivationDetailsProps> = ({ cr }) => {
  return (
    <Grid container>
      <Grid item xs={6} md={2}>
        <InfoBlock title={'Project Lead'}>
          <Typography>{fullNamePipe(cr.projectLead)}</Typography>
        </InfoBlock>
      </Grid>
      <Grid item xs={6} md={2}>
        <InfoBlock title={'Project Manager'}>
          <Typography>{fullNamePipe(cr.projectManager)}</Typography>
        </InfoBlock>
      </Grid>
      <Grid item xs={6} md={2}>
        <InfoBlock title={'Start Date'}>
          <Typography>{datePipe(cr.startDate)}</Typography>
        </InfoBlock>
      </Grid>
    </Grid>
  );
};

export default ActivationDetails;
