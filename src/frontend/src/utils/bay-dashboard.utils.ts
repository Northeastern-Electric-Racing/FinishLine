/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  BayDashboardSlot,
  BayDashboardSlotCreateArgs,
  BayDashboardWidgetSize,
  BayDashboardWidgetType,
  PublicBayDashboardWidget
} from 'shared';

export interface BayDashboardWidgetProps {
  size: BayDashboardWidgetSize;
  widget: PublicBayDashboardWidget;
}

export const bayDashboardWidgetDisplayNames: Record<BayDashboardWidgetType, string> = {
  [BayDashboardWidgetType.CALENDAR]: 'Calendar',
  [BayDashboardWidgetType.OVERDUE_WORK_PACKAGES]: 'Overdue Work Packages',
  [BayDashboardWidgetType.TEXT_FIELD]: 'Text Field',
  [BayDashboardWidgetType.TIER_LIST]: 'Tier List',
  [BayDashboardWidgetType.MBTA_TRACKER]: 'MBTA Tracker',
  [BayDashboardWidgetType.SLACK_APPRECIATIONS]: 'Appreciations',
  [BayDashboardWidgetType.SLACK_MENTIONS]: '@bay-dashboard'
};

// the TV's background, also used in the Admin Tools preview while loading
export const BAY_DASHBOARD_BACKGROUND = 'linear-gradient(to bottom, #000000 55%, #ef4244 140%)';

// order the size dropdowns appear in the Admin Tools widget selection
export const bayDashboardWidgetSizes = [
  BayDashboardWidgetSize.LARGE,
  BayDashboardWidgetSize.MEDIUM,
  BayDashboardWidgetSize.SMALL
];

const slotPositions: Record<BayDashboardWidgetSize, number> = {
  [BayDashboardWidgetSize.LARGE]: 0,
  [BayDashboardWidgetSize.MEDIUM]: 1,
  [BayDashboardWidgetSize.SMALL]: 2
};

export const WIDGET_WIDTH = 900;
export const widgetHeights: Record<BayDashboardWidgetSize, number> = {
  [BayDashboardWidgetSize.LARGE]: 900,
  [BayDashboardWidgetSize.MEDIUM]: 270,
  [BayDashboardWidgetSize.SMALL]: 170
};

const defaultSlot = (size: BayDashboardWidgetSize, type: BayDashboardWidgetType): BayDashboardSlot => ({
  bayDashboardSlotId: `default-${slotPositions[size]}`,
  size,
  position: slotPositions[size],
  rotationSeconds: 30,
  widgets: [{ bayDashboardWidgetId: `default-${slotPositions[size]}-0`, type, order: 0 }]
});

// the widget picked for each size in the Admin Tools
export type BayDashboardWidgetSelection = Partial<Record<BayDashboardWidgetSize, BayDashboardWidgetType>>;

/**
 * Puts the widget picked for each size into that size's slot
 */
export const applyWidgetSelection = (
  slots: BayDashboardSlot[],
  selection: BayDashboardWidgetSelection
): BayDashboardSlot[] => {
  // unselecting leaves the size in the selection as undefined, so only count sizes with a widget
  const sizes = (Object.keys(selection) as BayDashboardWidgetSize[]).filter((size) => selection[size]);
  const untouchedSlots = slots.filter((slot) => !sizes.includes(slot.size));

  const selectedSlots = sizes.map((size): BayDashboardSlot => {
    const existingSlot = slots.find((slot) => slot.size === size);
    return {
      bayDashboardSlotId: existingSlot?.bayDashboardSlotId ?? `preview-${size}`,
      size,
      position: slotPositions[size],
      rotationSeconds: existingSlot?.rotationSeconds ?? 30,
      widgets: [{ bayDashboardWidgetId: `preview-${size}-0`, type: selection[size] as BayDashboardWidgetType, order: 0 }]
    };
  });

  return [...untouchedSlots, ...selectedSlots].sort((a, b) => a.position - b.position);
};

/**
 * The layout the bay dashboard falls back to when the organization has never saved a config.
 */
export const defaultBayDashboardSlots: BayDashboardSlot[] = [
  defaultSlot(BayDashboardWidgetSize.LARGE, BayDashboardWidgetType.CALENDAR),
  defaultSlot(BayDashboardWidgetSize.MEDIUM, BayDashboardWidgetType.OVERDUE_WORK_PACKAGES),
  defaultSlot(BayDashboardWidgetSize.SMALL, BayDashboardWidgetType.TEXT_FIELD)
];

/**
 * Converts slots into what the save endpoint takes, each slot with at most one widget.
 */
export const toSlotCreateArgs = (slots: BayDashboardSlot[]): BayDashboardSlotCreateArgs[] =>
  slots.map(({ size, position, widgets }) => ({
    size,
    position,
    widget: widgets[0] && { type: widgets[0].type, text: widgets[0].text }
  }));
