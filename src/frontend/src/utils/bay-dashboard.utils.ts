/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BayDashboardSlot, BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';

export const bayDashboardWidgetDisplayNames: Record<BayDashboardWidgetType, string> = {
  [BayDashboardWidgetType.CALENDAR]: 'Calendar',
  [BayDashboardWidgetType.OVERDUE_WORK_PACKAGES]: 'Overdue Work Packages',
  [BayDashboardWidgetType.TEXT_FIELD]: 'Text Field',
  [BayDashboardWidgetType.TIER_LIST]: 'Tier List',
  [BayDashboardWidgetType.MBTA_TRACKER]: 'MBTA Tracker',
  [BayDashboardWidgetType.SLACK_APPRECIATIONS]: 'Appreciations',
  [BayDashboardWidgetType.SLACK_MENTIONS]: '@bay-dashboard'
};

// order the size dropdowns appear in the Admin Tools widget selection
export const bayDashboardWidgetSizes = [
  BayDashboardWidgetSize.SMALL,
  BayDashboardWidgetSize.MEDIUM,
  BayDashboardWidgetSize.LARGE
];

const defaultSlot = (size: BayDashboardWidgetSize, position: number, type: BayDashboardWidgetType): BayDashboardSlot => ({
  bayDashboardSlotId: `default-${position}`,
  size,
  position,
  rotationSeconds: 30,
  widgets: [{ bayDashboardWidgetId: `default-${position}-0`, type, order: 0 }]
});

/**
 * The layout the bay dashboard falls back to when the organization has never saved a config.
 */
export const defaultBayDashboardSlots: BayDashboardSlot[] = [
  defaultSlot(BayDashboardWidgetSize.LARGE, 0, BayDashboardWidgetType.CALENDAR),
  defaultSlot(BayDashboardWidgetSize.MEDIUM, 1, BayDashboardWidgetType.OVERDUE_WORK_PACKAGES),
  defaultSlot(BayDashboardWidgetSize.SMALL, 2, BayDashboardWidgetType.TEXT_FIELD)
];
