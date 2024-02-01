/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { yellow, green, blue, purple, grey } from '@mui/material/colors';
import { ChangeRequestStatus, ChangeRequestType, ReimbursementStatusType, WorkPackageStage } from 'shared';

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

export const ReimbursementRequestTypeTextPipe: (type: ReimbursementStatusType) => string = (type) => {
  switch (type) {
    case ReimbursementStatusType.ADVISOR_APPROVED:
      return 'Advisor Approved';
    case ReimbursementStatusType.DENIED:
      return 'Denied';
    case ReimbursementStatusType.PENDING_FINANCE:
      return 'Pending Finance';
    case ReimbursementStatusType.REIMBURSED:
      return 'Reimbursed';
    case ReimbursementStatusType.SABO_SUBMITTED:
      return 'Sabo Submitted';
  }
};
