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
 * A widget type that can be placed on a bay dashboard, along with the sizes it supports.
 */
export interface AvailableBayDashboardWidget {
  type: BayDashboardWidgetType;
  displayName: string;
  sizes: BayDashboardWidgetSize[];
}

export interface AvailableBayDashboardWidgets {
  widgets: AvailableBayDashboardWidget[];
}
