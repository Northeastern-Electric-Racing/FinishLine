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

/**
 * Only what the TV needs to render a widget
 */
export interface PublicBayDashboardWidget {
  type: BayDashboardWidgetType;
  order: number;
  text?: string;
}

export interface BayDashboardWidget extends PublicBayDashboardWidget {
  bayDashboardWidgetId: string;
}

export interface PublicBayDashboardSlot {
  size: BayDashboardWidgetSize;
  // 0 = left large, 1 = right medium, 2 = right small
  position: number;
  rotationSeconds: number;
  widgets: PublicBayDashboardWidget[];
}

export interface BayDashboardSlot extends PublicBayDashboardSlot {
  bayDashboardSlotId: string;
  widgets: BayDashboardWidget[];
}

export interface BayDashboardWidgetCreateArgs {
  type: BayDashboardWidgetType;
  text?: string;
}

export interface BayDashboardSlotCreateArgs {
  size: BayDashboardWidgetSize;
  position: number;
  widget?: BayDashboardWidgetCreateArgs;
}

export interface BayDashboardConfig {
  bayDashboardConfigId: string;
  dateCreated: Date;
  slots: BayDashboardSlot[];
}

/**
 * The config the unauthenticated TV loads
 */
export interface PublicBayDashboardConfig {
  slots: PublicBayDashboardSlot[];
}

export interface BayDashboardCountdown {
  bayDashboardCountdownId: string;
  name: string;
  startDate: Date;
  endDate?: Date;
}

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
