/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Card, CardContent, Typography } from '@mui/material';
import Chip from '@mui/material/Chip';
import { green, blue, red, grey, orange } from '@mui/material/colors';
import { Box, Stack } from '@mui/system';
import { Link } from '@mui/material';
import {
  ActivationChangeRequest,
  ChangeRequest,
  ChangeRequestType,
  StageGateChangeRequest,
  StandardChangeRequest,
  wbsPipe
} from 'shared';
import { routes } from '../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { datePipe, fullNamePipe } from '../utils/pipes';
import { Cancel, Construction, DateRange, Description, DoneAll, Person, Start, Work } from '@mui/icons-material';

const determineChangeRequestTypeView = (cr: ChangeRequest) => {
  switch (cr.type) {
    case 'STAGE_GATE':
      return <StageGateCardDetails cr={cr as StageGateChangeRequest} />;
    case 'ACTIVATION':
      return <ActivationCardDetails cr={cr as ActivationChangeRequest} />;
    default:
      return <StandardCardDetails cr={cr as StandardChangeRequest} />;
  }
};

const determineChangeRequestPillColor = (type: ChangeRequestType) => {
  switch (type) {
    case 'STAGE_GATE':
      return orange[900];
    case 'ACTIVATION':
      return green[600];
    case 'DEFINITION_CHANGE':
      return blue[600];
    case 'ISSUE':
      return red[400];
    default:
      return grey[500];
  }
};

const StandardCardDetails = ({ cr }: { cr: StandardChangeRequest }) => {
  return (
    <Box mt={1} ml={'2px'}>
      <Typography
        sx={{
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2
        }}
      >
        <Description sx={{ ml: '-4px', position: 'absolute' }} display={'inline'} />
        <Typography ml={'27px'} display={'inline'}>
          {cr.what}
        </Typography>
      </Typography>
    </Box>
  );
};

const StageGateCardDetails = ({ cr }: { cr: StageGateChangeRequest }) => {
  return (
    <Box ml={-1}>
      {cr.confirmDone ? (
        <Chip icon={<DoneAll />} label={'Done'} sx={{ backgroundColor: 'transparent' }} />
      ) : (
        <Chip icon={<Cancel />} label={'Not Done'} sx={{ backgroundColor: 'transparent' }} />
      )}
    </Box>
  );
};

const ActivationCardDetails = ({ cr }: { cr: ActivationChangeRequest }) => {
  return (
    <Box>
      <Stack direction="row">
        <Chip
          icon={<Construction />}
          label={fullNamePipe(cr.projectLead)}
          sx={{ backgroundColor: 'transparent', mr: 2, ml: -1, maxWidth: '150' }}
        />
        <Chip icon={<Work />} label={fullNamePipe(cr.projectManager)} sx={{ backgroundColor: 'transparent' }} />
      </Stack>
      <Stack direction="row" justifyContent={'space-between'}>
        <Chip icon={<Start />} label={datePipe(cr.startDate)} sx={{ backgroundColor: 'transparent', ml: -1 }} />
      </Stack>
    </Box>
  );
};

interface ChangeRequestDetailCardProps {
  changeRequest: ChangeRequest;
}

// Convert work package stage into badge for display
const ChangeRequestDetailCard: React.FC<ChangeRequestDetailCardProps> = ({ changeRequest }) => {
  const ChangeRequestTypeView = () => determineChangeRequestTypeView(changeRequest);
  const pillColor = determineChangeRequestPillColor(changeRequest.type);
  return (
    <Card sx={{ maxWidth: 300 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography fontWeight={'regular'} variant="h6" fontSize={15}>
              <Link component={RouterLink} to={`${routes.CHANGE_REQUESTS}/${changeRequest.crId}`} noWrap>
                {'CR #' + changeRequest.crId}
              </Link>
            </Typography>
          </Box>
          <Box sx={{ marginLeft: 2 }} minWidth={'fit-content'}>
            <Chip
              size="small"
              label={changeRequest.type}
              variant="outlined"
              sx={{
                fontSize: 10,
                mr: '5px',
                color: pillColor,
                borderColor: pillColor
              }}
            />
          </Box>
        </Stack>
        <Stack direction="row">
          <Chip
            icon={<Person />}
            label={fullNamePipe(changeRequest.submitter)}
            sx={{ mr: 2, ml: -1, backgroundColor: 'transparent', maxWidth: '150' }}
          />
          <Chip icon={<DateRange />} label={datePipe(changeRequest.dateSubmitted)} sx={{ backgroundColor: 'transparent' }} />
        </Stack>
        <Typography fontWeight={'regular'} variant="h6" fontSize={15} noWrap>
          <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbsNum)}`}>
            {wbsPipe(changeRequest.wbsNum)} - {changeRequest.wbsName}
          </Link>
        </Typography>
        <ChangeRequestTypeView />
      </CardContent>
    </Card>
  );
};

export default ChangeRequestDetailCard;
