/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { User } from 'shared';
import { datePipe, emDashPipe, fullNamePipe } from '../../../../pipes';
import PageBlock from '../../../../layouts/page-block/page-block';

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
