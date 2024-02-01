/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chip from '@mui/material/Chip';
import { green, red, grey, purple, yellow, orange } from '@mui/material/colors';
import { ReimbursementStatusType } from 'shared';
import { ReimbursementRequestTypeTextPipe } from '../utils/enum-pipes';

const determineStatusPillColor = (status: ReimbursementStatusType) => {
  switch (status) {
    case ReimbursementStatusType.PENDING_FINANCE:
      return yellow[600];
    case ReimbursementStatusType.SABO_SUBMITTED:
      return orange[600];
    case ReimbursementStatusType.ADVISOR_APPROVED:
      return purple[600];
    case ReimbursementStatusType.REIMBURSED:
      return green[600];
    case ReimbursementStatusType.DENIED:
      return red[600];
    default:
      return grey[600];
  }
};

const ReimbursementRequestStatusPill = ({ status }: { status: ReimbursementStatusType }) => {
  const statusPillColor = determineStatusPillColor(status);
  return (
    <Chip
      size="small"
      label={ReimbursementRequestTypeTextPipe(status)}
      variant="filled"
      sx={{
        fontSize: 12,
        color: 'white',
        backgroundColor: statusPillColor,
        width: 125
      }}
    />
  );
};

export default ReimbursementRequestStatusPill;
