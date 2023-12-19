/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import Chip from '@mui/material/Chip';
import { green, blue, red, grey, purple } from '@mui/material/colors';
import { Box, Stack } from '@mui/system';
import { Link } from '@mui/material';
import { ChangeRequest, ChangeRequestStatus, ChangeRequestType, StandardChangeRequest, wbsPipe } from 'shared';
import { routes } from '../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { fullNamePipe } from '../utils/pipes';
import { ChangeRequestTypeTextPipe, ChangeRequestStatusTextPipe } from '../utils/enum-pipes';

const determineChangeRequestTypeView = (cr: ChangeRequest) => {
  switch (cr.status) {
    case 'Implemented':
      return <ImplementedCardDetails cr={cr} />;
    default:
      return <StandardCardDetails cr={cr as StandardChangeRequest} />;
  }
};

const determineChangeRequestStatusPillColor = (status: ChangeRequestStatus) => {
  switch (status) {
    case 'Implemented':
      return blue[600];
    case 'Accepted':
      return green[600];
    case 'Denied':
      return red[400];
    case 'Open':
      return purple[400];
    default:
      return grey[500];
  }
};

const determineChangeRequestTypeDesc = (type: ChangeRequestType) => {
  switch (type) {
    case 'ISSUE':
      return 'Issue';
    case 'DEFINITION_CHANGE':
      return 'Redefinition';
    case 'OTHER':
      return 'Other';
    case 'STAGE_GATE':
      return 'Stage Gate';
    case 'ACTIVATION':
      return 'Activation';
    default:
      return 'Other';
  }
};

const ImplementedCardDetails = ({ cr }: { cr: ChangeRequest }) => {
  const theme = useTheme();
  const DescriptionType = determineChangeRequestTypeDesc(cr.type);
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.divider,
        width: '100%',
        minHeight: 75,
        borderRadius: 1,
        marginTop: 1,
        paddingTop: 0.5,
        paddingLeft: 1,
        paddingRight: 1,
        paddingBottom: 0.5
      }}
    >
      <Typography variant="body1" fontSize={14} noWrap>
        {DescriptionType + ': '}
        <Link color="inherit" component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(cr.wbsNum)}`}>
          {wbsPipe(cr.wbsNum)}
        </Link>
      </Typography>
    </Box>
  );
};

const StandardCardDetails = ({ cr }: { cr: StandardChangeRequest }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.divider,
        width: '100%',
        minHeight: 75,
        borderRadius: 1,
        marginTop: 1,
        paddingTop: 0.5,
        paddingLeft: 1,
        paddingRight: 1,
        paddingBottom: 0.5
      }}
    >
      {cr.what}
    </Box>
  );
};

const ChangeRequestTypePill = ({ type }: { type: ChangeRequestType }) => {
  return (
    <Chip
      size="small"
      label={ChangeRequestTypeTextPipe(type)}
      variant="filled"
      sx={{
        fontSize: 12,
        color: 'white',
        backgroundColor: red[600],
        mb: 0.5,
        width: 100
      }}
    />
  );
};

const ChangeRequestStatusPill = ({ status }: { status: ChangeRequestStatus }) => {
  const statusPillColor = determineChangeRequestStatusPillColor(status);
  return (
    <Chip
      size="small"
      label={ChangeRequestStatusTextPipe(status)}
      variant="filled"
      sx={{
        fontSize: 12,
        color: 'white',
        backgroundColor: statusPillColor,
        mb: 0.5,
        width: 100
      }}
    />
  );
};

const ChangeRequestCardHeader = ({ cr }: { cr: ChangeRequest }) => {
  return (
    <Link underline={'none'} color={'inherit'} component={RouterLink} to={`${routes.CHANGE_REQUESTS}/${cr.crId}`} noWrap>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {'Change Request #' + cr.crId}
      </Typography>
    </Link>
  );
};

const ChangeRequestStatusTypePills = ({ cr }: { cr: ChangeRequest }) => {
  return (
    <Stack direction={'column'} spacing={1}>
      <ChangeRequestTypePill type={cr.type} />
      <ChangeRequestStatusPill status={cr.status} />
    </Stack>
  );
};

const ChangeRequestSubWBSDetails = ({ cr }: { cr: ChangeRequest }) => {
  return (
    <Stack direction={'column'}>
      <Typography variant="body1" sx={{ mr: 2, fontWeight: 'bold', fontSize: 13 }}>
        From: {fullNamePipe(cr.submitter)}
      </Typography>
      <Typography fontWeight={'bold'} variant="h1" fontSize={13} noWrap>
        WBS:{' '}
        <Link color={'inherit'} component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(cr.wbsNum)}`}>
          {wbsPipe(cr.wbsNum)} {cr.wbsName}
        </Link>
      </Typography>
    </Stack>
  );
};

interface ChangeRequestDetailCardProps {
  changeRequest: ChangeRequest;
}

// Convert work package stage into badge for display
const ChangeRequestDetailCard: React.FC<ChangeRequestDetailCardProps> = ({ changeRequest }) => {
  const ChangeRequestTypeView = () => determineChangeRequestTypeView(changeRequest);
  return (
    <Card sx={{ width: 325, mr: 2, borderRadius: 3, mb: 2 }}>
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="flex-start">
          <Grid item xs mb={1} mt={-1.5}>
            <ChangeRequestCardHeader cr={changeRequest} />
            <ChangeRequestSubWBSDetails cr={changeRequest} />
          </Grid>
          <Grid item xs="auto">
            <ChangeRequestStatusTypePills cr={changeRequest} />
          </Grid>
        </Grid>
        <ChangeRequestTypeView />
      </CardContent>
    </Card>
  );
};

export default ChangeRequestDetailCard;
