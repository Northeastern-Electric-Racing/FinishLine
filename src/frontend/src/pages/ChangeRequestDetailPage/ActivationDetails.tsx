/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ActivationChangeRequest } from 'shared';
import { datePipe, fullNamePipe } from '../../utils/pipes';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import InfoBlock from '../../components/InfoBlock';
import HandymanIcon from '@mui/icons-material/Handyman';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface ActivationDetailsProps {
  cr: ActivationChangeRequest;
}

const ActivationDetails: React.FC<ActivationDetailsProps> = ({ cr }) => {
  return (
    <Grid container rowSpacing={'10px'} mb="10px">
      <Grid item xs={6} md={3}>
        <InfoBlock title={'Project Lead'} icon={<HandymanIcon />}>
          <Typography>{fullNamePipe(cr.projectLead)}</Typography>
        </InfoBlock>
      </Grid>
      <Grid item xs={6} md={3}>
        <InfoBlock title={'Project Manager'} icon={<WorkIcon />}>
          <Typography>{fullNamePipe(cr.projectManager)}</Typography>
        </InfoBlock>
      </Grid>
      <Grid item xs={6} md={3}>
        <InfoBlock title={'Start Date'} icon={<CalendarTodayIcon />}>
          <Typography>{datePipe(cr.startDate)}</Typography>
        </InfoBlock>
      </Grid>
    </Grid>
  );
};

export default ActivationDetails;
