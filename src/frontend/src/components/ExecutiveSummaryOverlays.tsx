/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import ExecutiveSummaryBudgetOverlay from './ExecutiveSummaryBudgetOverlay';
import RecruitmentMembershipOverlay from './RecruitmentMembershipOverlay';

export enum OverlayTab {
  BUDGET = 'BUDGET',
  RECRUITMENT_MEMBERSHIP = 'RECRUITMENT_MEMBERSHIP'
}

export const OVERLAY_TABS: { value: OverlayTab; label: string }[] = [
  { value: OverlayTab.BUDGET, label: 'Budget' },
  { value: OverlayTab.RECRUITMENT_MEMBERSHIP, label: 'Recruitment & Membership' }
];

interface ExecutiveSummaryOverlaysProps {
  tab: OverlayTab;
}

/**
 * Holds the executive summary overlays, which compare data across seasons instead of showing a single car.
 */
const ExecutiveSummaryOverlays: React.FC<ExecutiveSummaryOverlaysProps> = ({ tab }) => {
  switch (tab) {
    case OverlayTab.BUDGET:
      return <ExecutiveSummaryBudgetOverlay />;
    case OverlayTab.RECRUITMENT_MEMBERSHIP:
      return <RecruitmentMembershipOverlay />;
  }
};

export default ExecutiveSummaryOverlays;
