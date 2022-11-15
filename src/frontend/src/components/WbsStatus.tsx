/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chip from '@mui/material/Chip';
import { WbsElementStatus } from 'shared';

interface WbsStatusProps {
  status: WbsElementStatus;
}

type WbsStatusColor = 'primary' | 'secondary' | 'success';

// maps status to the desired color state
const colorMap: Record<WbsElementStatus, WbsStatusColor> = {
  [WbsElementStatus.Active]: 'primary',
  [WbsElementStatus.Inactive]: 'secondary',
  [WbsElementStatus.Complete]: 'success'
};

// maps status to the desired badge display text
const textMap: Record<WbsElementStatus, string> = {
  [WbsElementStatus.Active]: 'Active',
  [WbsElementStatus.Inactive]: 'Inactive',
  [WbsElementStatus.Complete]: 'Complete'
};

// Convert WBS Element status into badge for display
const WbsStatus: React.FC<WbsStatusProps> = ({ status }) => {
  const color: WbsStatusColor = colorMap[status];
  const text: string = textMap[status];

  return (
    <b>
      <Chip label={text} color={color} sx={{ fontSize: 14 }} />
    </b>
  );
};

export default WbsStatus;
