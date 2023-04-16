/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { yellow, green, blue, purple, grey } from '@mui/material/colors';
import { WorkPackageStage } from 'shared';

// maps stage to the desired color
export const WorkPackageStageColorPipe: (stage: WorkPackageStage | undefined) => string = (stage) => {
  switch (stage) {
    case WorkPackageStage.Research:
      return yellow[900];
    case WorkPackageStage.Design:
      return green[600];
    case WorkPackageStage.Manufacturing:
      return blue[600];
    case WorkPackageStage.Integration:
      return purple[400];
    default:
      return grey[500];
  }
};

// maps stage to the desired badge display text
export const WorkPackageStageTextPipe: (stage: WorkPackageStage | undefined) => string = (stage) => {
  switch (stage) {
    case WorkPackageStage.Research:
      return 'Research';
    case WorkPackageStage.Design:
      return 'Design';
    case WorkPackageStage.Manufacturing:
      return 'Manufacturing';
    case WorkPackageStage.Integration:
      return 'Integration';
    default:
      return 'No Stage';
  }
};
