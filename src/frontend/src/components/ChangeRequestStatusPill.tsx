/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chip from '@mui/material/Chip';
import { green, blue, red, grey, purple } from '@mui/material/colors';
import { ChangeRequestStatus } from 'shared';
import { ChangeRequestStatusTextPipe } from '../utils/enum-pipes';

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

export default ChangeRequestStatusPill;
