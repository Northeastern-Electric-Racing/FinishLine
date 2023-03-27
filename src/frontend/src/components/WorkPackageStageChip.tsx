/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chip from '@mui/material/Chip';
import { yellow, green, blue, purple } from '@mui/material/colors';
import { WorkPackageStage } from 'shared';

interface WorkPackageStageChipProps {
  stage: WorkPackageStage;
}

// maps stage to the desired color
const colorMap: Record<WorkPackageStage, string> = {
  [WorkPackageStage.Research]: yellow[900],
  [WorkPackageStage.Design]: green[600],
  [WorkPackageStage.Manufacturing]: blue[600],
  [WorkPackageStage.Integration]: purple[400]
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
  const color: string = colorMap[stage];

  const text: string = textMap[stage];

  return (
    <b>
      <Chip
        size="small"
        label={text}
        variant="outlined"
        sx={{
          fontSize: 14,
          mr: '0px',
          color,
          borderColor: color
        }}
      />
    </b>
  );
};

export default WorkPackageStageChip;
