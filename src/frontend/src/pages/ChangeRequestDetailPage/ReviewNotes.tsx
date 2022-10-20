/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { User } from 'shared';
import { datePipe, emDashPipe, fullNamePipe } from '../../utils/Pipes';
import PageBlock from '../../layouts/PageBlock';

interface ReviewNotesProps {
  reviewer?: User;
  reviewNotes?: string;
  dateReviewed?: Date;
}

const ReviewNotes: React.FC<ReviewNotesProps> = ({
  reviewer,
  reviewNotes,
  dateReviewed
}: ReviewNotesProps) => {
  return (
    <PageBlock
      title={'Review Notes'}
      headerRight={
        <OverlayTrigger
          placement="left"
          overlay={
            <Tooltip id="tooltip">
              {'Reviewed on: ' + (dateReviewed ? datePipe(dateReviewed) : emDashPipe(''))}
            </Tooltip>
          }
        >
          <span>{fullNamePipe(reviewer)}</span>
        </OverlayTrigger>
      }
    >
      {reviewNotes ? reviewNotes : 'There are no review notes for this change request.'}
    </PageBlock>
  );
};

export default ReviewNotes;
