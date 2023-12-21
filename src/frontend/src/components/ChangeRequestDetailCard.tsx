/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import Chip from '@mui/material/Chip';
import { green, blue, red, grey, purple } from '@mui/material/colors';
import { Box, Stack } from '@mui/system';
import { Link } from '@mui/material';
import {
  ActivationChangeRequest,
  ChangeRequest,
  ChangeRequestStatus,
  ChangeRequestType,
  StandardChangeRequest,
  wbsPipe
} from 'shared';
import { routes } from '../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { fullNamePipe } from '../utils/pipes';
import { ChangeRequestTypeTextPipe, ChangeRequestStatusTextPipe } from '../utils/enum-pipes';

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

const CRCardDescription = ({ cr }: { cr: ChangeRequest }) => {
  const theme = useTheme();
  const isAccepted = cr.status === ChangeRequestStatus.Implemented || cr.status === ChangeRequestStatus.Accepted;
  const isStageGate = cr.type === ChangeRequestType.StageGate;
  const isActivation = cr.type === ChangeRequestType.Activation;
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
        {isAccepted ? (
          cr.reviewNotes ? (
            'Review Notes: ' + cr.reviewNotes
          ) : (
            'No review notes'
          )
        ) : isActivation ? (
          <div>
            <Typography variant="body1" fontSize={14}>
              Lead: {fullNamePipe((cr as ActivationChangeRequest).projectLead)}
            </Typography>
            <Typography variant="body1" fontSize={14}>
              Manager: {fullNamePipe((cr as ActivationChangeRequest).projectManager)}
            </Typography>
          </div>
        ) : isStageGate ? (
          'Stage Gate ' + wbsPipe(cr.wbsNum) + ' - ' + cr.wbsName
        ) : (
          (cr as StandardChangeRequest).what
        )}
      </Typography>
    </Box>
  );
};

interface ChangeRequestDetailCardProps {
  changeRequest: ChangeRequest;
}

const ChangeRequestDetailCard: React.FC<ChangeRequestDetailCardProps> = ({ changeRequest }) => {
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
            <Stack direction={'column'} maxWidth={'195px'}>
              <Typography variant="body1" sx={{ mr: 2, fontWeight: 'bold', fontSize: 13 }}>
                From: {fullNamePipe(changeRequest.submitter)}
              </Typography>
              <Typography fontWeight={'bold'} fontSize={12} noWrap>
                <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbsNum)}`}>
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
        <CRCardDescription cr={changeRequest} />
      </CardContent>
    </Card>
  );
};

export default ChangeRequestDetailCard;
