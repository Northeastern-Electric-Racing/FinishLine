/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from 'shared';
import { datePipe, emDashPipe, fullNamePipe } from '../../utils/pipes';
import PageBlock from '../../layouts/PageBlock';
import { Tooltip, Typography } from '@mui/material';

interface ReviewNotesProps {
  reviewer?: User;
  reviewNotes?: string;
  dateReviewed?: Date;
}

const ReviewNotes = ({ reviewer, reviewNotes, dateReviewed }: ReviewNotesProps) => {
  return (
    <PageBlock
      title={'Review Notes'}
      headerRight={
        <Tooltip
          id="tooltip"
          arrow
          placement="left"
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
          <span>{fullNamePipe(reviewer)}</span>
        </Tooltip>
      }
    >
      {reviewNotes ? reviewNotes : 'There are no review notes for this change request.'}
    </PageBlock>
  );
};

export default ReviewNotes;
