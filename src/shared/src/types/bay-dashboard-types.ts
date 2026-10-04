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

export interface BayDashboardWidget {
  bayDashboardWidgetId: string;
  type: BayDashboardWidgetType;
  order: number;
  text?: string;
}

export interface BayDashboardSlot {
  bayDashboardSlotId: string;
  position: number;
  size: BayDashboardWidgetSize;
  rotationSeconds: number;
  widgets: BayDashboardWidget[];
}

export interface BayDashboardConfig {
  bayDashboardConfigId: string;
  dateCreated: Date;
  dateDeleted?: Date;
  userCreatedId: string;
  slots: BayDashboardSlot[];
}
