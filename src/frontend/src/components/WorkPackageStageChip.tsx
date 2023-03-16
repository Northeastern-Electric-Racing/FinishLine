/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chip from '@mui/material/Chip';
import { WorkPackageStageTextPipe, WorkPackageStageColorPipe } from '../utils/enum-pipes';
import { WorkPackageStage } from 'shared';

interface WorkPackageStageChipProps {
  stage: WorkPackageStage;
}

const WorkPackageStageChip: React.FC<WorkPackageStageChipProps> = ({ stage }) => {
  let color: string;
  let text: string;

  if (stage) {
    color = WorkPackageStageColorPipe[stage];
    text = WorkPackageStageTextPipe[stage];
  } else {
    color = 'gray';
    text = 'NO STAGE';
  }

  return (
    <b>
      <Chip
        size="small"
        label={text}
        variant="outlined"
        sx={{
          fontSize: 14,
          mr: '5px',
          color,
          borderColor: color
        }}
      />
    </b>
  );
};

export default WorkPackageStageChip;
