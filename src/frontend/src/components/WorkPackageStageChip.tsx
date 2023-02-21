/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chip from '@mui/material/Chip';
import { WorkPackageStage } from 'shared';

interface WorkPackageStageChipProps {
  stage: WorkPackageStage;
}

type WorkPackageStageChipColor = 'primary' | 'secondary' | 'success' | 'default' | 'error' | 'info' | 'warning';

// maps stage to the desired color state
const colorMap: Record<WorkPackageStage, WorkPackageStageChipColor> = {
  [WorkPackageStage.Research]: 'success',
  [WorkPackageStage.Design]: 'success',
  [WorkPackageStage.Manufacturing]: 'success',
  [WorkPackageStage.Integration]: 'success'
};

// maps stage to the desired badge display text
const textMap: Record<WorkPackageStage, string> = {
  [WorkPackageStage.Research]: 'Research',
  [WorkPackageStage.Design]: 'Design',
  [WorkPackageStage.Manufacturing]: 'Manufacturing',
  [WorkPackageStage.Integration]: 'Integration'
};

// Convert work package stage into badge for display
const WorkPackageStageChip: React.FC<WorkPackageStageChipProps> = ({ stage }) => {
  const color: WorkPackageStageChipColor = colorMap[stage];
  const text: string = textMap[stage];

  return (
    <b>
      <Chip
        size="small"
        label={text}
        color={color}
        variant="outlined"
        sx={{
          fontSize: 14,
          mx: '5px'
        }}
      />
    </b>
  );
};

export default WorkPackageStageChip;
