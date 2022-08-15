/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Badge } from 'react-bootstrap';
import { WbsElementStatus } from 'shared';

interface WbsStatusProps {
  status: WbsElementStatus;
}

// Convert WBS Element status into badge for display
const WbsStatus: React.FC<WbsStatusProps> = ({ status }) => {
  let color = 'primary';
  let text = 'Active';

  if (status === WbsElementStatus.Inactive) {
    color = 'secondary';
    text = 'Inactive';
  }
  if (status === WbsElementStatus.Complete) {
    color = 'success';
    text = 'Complete';
  }

  return (
    <b>
      <Badge pill variant={color}>
        {text}
      </Badge>
    </b>
  );
};

export default WbsStatus;
