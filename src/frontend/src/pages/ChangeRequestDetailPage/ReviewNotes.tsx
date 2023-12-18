/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from 'shared';
import { datePipe, emDashPipe, fullNamePipe } from '../../utils/pipes';
import { Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

interface ReviewNotesProps {
  reviewer?: User;
  reviewNotes?: string;
  dateReviewed?: Date;
}

const ReviewNotes: React.FC<ReviewNotesProps> = ({ reviewer, reviewNotes, dateReviewed }: ReviewNotesProps) => {
  return (
    <h1>
      <Typography 
      sx={{ fontWeight: 'bold', fontSize: 30, fontFamily: 'oswald,sans-serif'}}>Review Notes </Typography> 
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
          <Grid container>
          <Grid item xs = {2}>
            <Typography sx={{ maxWidth: '140px', fontWeight: 'bold' }}>{fullNamePipe(reviewer)}</Typography>
            </Grid>
            <Typography sx = {{fontSize:15}}>{reviewNotes ? reviewNotes : <Typography sx = {{ maxWidth: '375px'}}>There are no review notes for this change request. </Typography>}</Typography>
            </Grid>
        </Tooltip>
    </h1>
  );
};

export default ReviewNotes;
