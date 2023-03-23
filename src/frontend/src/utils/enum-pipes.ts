import { yellow, green, blue, purple, grey } from '@mui/material/colors';
import { WorkPackageStage } from 'shared';

// maps stage to the desired color
export const WorkPackageStageColorPipe: Record<WorkPackageStage | '', string> = {
  [WorkPackageStage.Research]: yellow[900],
  [WorkPackageStage.Design]: green[600],
  [WorkPackageStage.Manufacturing]: blue[600],
  [WorkPackageStage.Integration]: purple[400],
  '': grey[500]
};

// maps stage to the desired badge display text
export const WorkPackageStageTextPipe: Record<WorkPackageStage, string> = {
  [WorkPackageStage.Research]: 'Research',
  [WorkPackageStage.Design]: 'Design',
  [WorkPackageStage.Manufacturing]: 'Manufacturing',
  [WorkPackageStage.Integration]: 'Integration'
};
