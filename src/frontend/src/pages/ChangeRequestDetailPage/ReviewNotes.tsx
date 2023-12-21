/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from 'shared';
import { datePipe, emDashPipe, fullNamePipe } from '../../utils/pipes';
import { Tooltip, Typography } from '@mui/material';
import InfoBlock from '../../components/InfoBlock';

interface ReviewNotesProps {
  reviewer?: User;
  reviewNotes?: string;
  dateReviewed?: Date;
}

const ReviewNotes: React.FC<ReviewNotesProps> = ({ reviewer, reviewNotes, dateReviewed }: ReviewNotesProps) => {
  return (
    <InfoBlock title={'Review Notes'}>
      <Typography>
        <Tooltip
          id="tooltip"
          arrow
          placement="bottom"
          title={
            <Typography
              sx={{
                fontSize: 14
              }}
            >
              {'Reviewed on: ' + (dateReviewed ? datePipe(dateReviewed) : emDashPipe(''))}
            </Typography>
          }
        >
          <span>{fullNamePipe(reviewer)} — </span>
        </Tooltip>
        {reviewNotes ?? 'There are no review notes for this change request.'}
      </Typography>
    </InfoBlock>
  );
};

export default ReviewNotes;
