/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { yellow, green, blue, purple, grey, orange, indigo, pink, deepOrange } from '@mui/material/colors';
import { ChangeRequestStatus, ChangeRequestType, WbsElementStatus, WorkPackageStage } from 'shared';

// maps stage to the desired color
export const WorkPackageStageColorPipe: (stage: WorkPackageStage | undefined) => string = (stage) => {
  switch (stage) {
    case WorkPackageStage.Research:
      return yellow[900];
    case WorkPackageStage.Design:
      return green[600];
    case WorkPackageStage.Manufacturing:
      return blue[600];
    case WorkPackageStage.Install:
      return purple[400];
    case WorkPackageStage.Testing:
      return orange[400];
    default:
      return grey[500];
  }
};

// maps stage and status to the desired color for Gantt Chart
export const GanttWorkPackageStageColorPipe: (stage: WorkPackageStage | undefined, status: WbsElementStatus) => string = (
  stage,
  status
) => {
  if (status === WbsElementStatus.Active) {
    switch (stage) {
      case WorkPackageStage.Research:
        return orange[800];
      case WorkPackageStage.Design:
        return green[800];
      case WorkPackageStage.Manufacturing:
        return indigo[600];
      case WorkPackageStage.Install:
        return pink[500];
      case WorkPackageStage.Testing:
        return yellow[600];
      default:
        return grey[500];
    }
  } else if (status === WbsElementStatus.Inactive) {
    switch (stage) {
      case WorkPackageStage.Research:
        return orange[600];
      case WorkPackageStage.Design:
        return green[600];
      case WorkPackageStage.Manufacturing:
        return indigo[400];
      case WorkPackageStage.Install:
        return pink[300];
      case WorkPackageStage.Testing:
        return yellow[400];
      default:
        return grey[500];
    }
  } else {
    switch (stage) {
      case WorkPackageStage.Research:
        return deepOrange[800];
      case WorkPackageStage.Design:
        return green[900];
      case WorkPackageStage.Manufacturing:
        return indigo[900];
      case WorkPackageStage.Install:
        return pink[800];
      case WorkPackageStage.Testing:
        return yellow[800];
      default:
        return grey[500];
    }
  }
};

// maps stage to the desired color
export const GanttWorkPackageTextColorPipe: (stage: WorkPackageStage | undefined) => string = (stage) => {
  switch (stage) {
    case WorkPackageStage.Research:
    case WorkPackageStage.Design:
    case WorkPackageStage.Manufacturing:
    case WorkPackageStage.Install:
      return '#ffffff';
    case WorkPackageStage.Testing:
      return '#000000';
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
    case WorkPackageStage.Install:
      return 'Install';
    case WorkPackageStage.Testing:
      return 'Testing';
    default:
      return 'No Stage';
  }
};

export const ChangeRequestTypeTextPipe: (type: ChangeRequestType) => string = (type) => {
  switch (type) {
    case ChangeRequestType.Activation:
      return 'Activation';
    case ChangeRequestType.Redefinition:
      return 'Redefinition';
    case ChangeRequestType.StageGate:
      return 'Stage Gate';
    case ChangeRequestType.Issue:
      return 'Issue';
    case ChangeRequestType.Other:
      return 'Other';
  }
};

export const ChangeRequestStatusTextPipe: (status: ChangeRequestStatus) => string = (status) => {
  switch (status) {
    case ChangeRequestStatus.Implemented:
      return 'Implemented';
    case ChangeRequestStatus.Accepted:
      return 'Accepted';
    case ChangeRequestStatus.Denied:
      return 'Denied';
    case ChangeRequestStatus.Open:
      return 'Open';
  }
};
