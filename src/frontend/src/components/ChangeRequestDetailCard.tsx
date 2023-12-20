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

// Might not be the best way to do this. Open for suggestions.
const determineChangeRequestTypeView = (cr: ChangeRequest) => {
  switch (cr.type) {
    case ChangeRequestType.Activation: // could just be done in an if with && let me know your thoughts
    case ChangeRequestType.StageGate:
      return cr.status === ChangeRequestStatus.Implemented ? (
        <ImplementedCardDetails cr={cr} />
      ) : (
        <StageGateActivationCardDetails cr={cr} />
      );
    default:
      return <StandardCardDetails cr={cr as StandardChangeRequest} />;
  }
};

// should I use object mapping instead of switch statements?
const determineChangeRequestStatusPillColor = (status: ChangeRequestStatus) => {
  switch (status) {
    case ChangeRequestStatus.Implemented:
      return blue[600];
    case ChangeRequestStatus.Accepted:
      return green[600];
    case ChangeRequestStatus.Denied:
      return red[400];
    case ChangeRequestStatus.Open:
      return purple[400];
    default:
      return grey[500];
  }
};

// same for here ^^
const determineChangeRequestTypeDesc = (type: ChangeRequestType) => {
  switch (type) {
    case ChangeRequestType.StageGate:
      return 'Stage Gate';
    case ChangeRequestType.Activation:
      return 'Activate';
    default:
      return 'Other';
  }
};

// return the review notes for a change request if there are any otherwise display No notes
const ImplementedCardDetails = ({ cr }: { cr: ChangeRequest }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.divider,
        width: '100%',
        height: 75,
        borderRadius: 1,
        padding: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      <Typography variant="body1" fontSize={14}>
        {cr.reviewNotes ? cr.reviewNotes : 'No review notes'}
      </Typography>
    </Box>
  );
};

// could possibly abstract these as the contents are the only difference
// non implemented change requests that are of stage gat and activation type
const StageGateActivationCardDetails = ({ cr }: { cr: ChangeRequest }) => {
  const theme = useTheme();
  const descriptionType = determineChangeRequestTypeDesc(cr.type);
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.divider,
        width: '100%',
        height: 75,
        borderRadius: 1,
        padding: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      <Typography variant="body1" fontSize={14}>
        {descriptionType + ': '}
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
        height: 75,
        borderRadius: 1,
        padding: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      <Typography variant="body1" fontSize={14}>
        {cr.what}
      </Typography>
    </Box>
  );
};

// I can abstract the two pills into one component but I'm not sure if it's worth it since the difference is the label and color
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
        width: 100
      }}
    />
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
            <Link
              underline={'none'}
              color={'inherit'}
              component={RouterLink}
              to={`${routes.CHANGE_REQUESTS}/${changeRequest.crId}`}
            >
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {'Change Request #' + changeRequest.crId}
              </Typography>
            </Link>
            <Stack direction={'column'}>
              <Typography variant="body1" sx={{ mr: 2, fontWeight: 'bold', fontSize: 13 }}>
                From: {fullNamePipe(changeRequest.submitter)}
              </Typography>
              <Typography fontWeight={'bold'} variant="h1" fontSize={13} noWrap>
                WBS:{' '}
                <Link color={'inherit'} component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbsNum)}`}>
                  {wbsPipe(changeRequest.wbsNum)} {changeRequest.wbsName}
                </Link>
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs="auto" mb={1}>
            <Stack direction={'column'} spacing={1}>
              <ChangeRequestTypePill type={changeRequest.type} />
              <ChangeRequestStatusPill status={changeRequest.status} />
            </Stack>
          </Grid>
        </Grid>
        <ChangeRequestTypeView />
      </CardContent>
    </Card>
  );
};

export default ChangeRequestDetailCard;
