export type BayDashboardWidgetSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type BayDashboardWidgetType =
  | 'CALENDAR'
  | 'OVERDUE_WORK_PACKAGES'
  | 'TEXT_FIELD'
  | 'TIER_LIST'
  | 'MBTA_TRACKER'
  | 'SLACK_APPRECIATIONS'
  | 'SLACK_MENTIONS';

/**
 * One slot of a saved bay dashboard config. A slot holds at most one widget (for now)
 */
export interface BayDashboardSlotInput {
  position: number;
  size: BayDashboardWidgetSize;
  rotationSeconds?: number;
  widget?: {
    type: BayDashboardWidgetType;
    text?: string;
  };
}
