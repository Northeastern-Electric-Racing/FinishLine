export enum BayDashboardWidgetSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

export enum BayDashboardWidgetType {
  CALENDAR = 'CALENDAR',
  OVERDUE_WORK_PACKAGES = 'OVERDUE_WORK_PACKAGES',
  TEXT_FIELD = 'TEXT_FIELD',
  TIER_LIST = 'TIER_LIST',
  MBTA_TRACKER = 'MBTA_TRACKER',
  SLACK_APPRECIATIONS = 'SLACK_APPRECIATIONS',
  SLACK_MENTIONS = 'SLACK_MENTIONS'
}

export interface BayDashboardWidget {
  bayDashboardWidgetId: string;
  type: BayDashboardWidgetType;
  order: number;
  text?: string;
}

export interface BayDashboardSlot {
  bayDashboardSlotId: string;
  size: BayDashboardWidgetSize;
  // 0 = left large, 1 = right medium, 2 = right small
  position: number;
  rotationSeconds: number;
  widgets: BayDashboardWidget[];
}

export interface BayDashboardConfig {
  bayDashboardConfigId: string;
  dateCreated: Date;
  slots: BayDashboardSlot[];
}
