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
  // the organization's slug, for widgets that load their own data
  slug?: string;
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

// A widget picked for a size in the Admin Tools.
// Only text field widgets carry text.
export interface BayDashboardWidgetChoice {
  type: BayDashboardWidgetType;
  text?: string;
}

// the widget picked for each size in the Admin Tools
export type BayDashboardWidgetSelection = Partial<Record<BayDashboardWidgetSize, BayDashboardWidgetChoice>>;

/**
 * Puts the widget picked for each size into that size's slot
 */
export const applyWidgetSelection = (
  slots: BayDashboardSlot[],
  selection: BayDashboardWidgetSelection
): BayDashboardSlot[] => {
  // unselecting leaves the size in the selection as undefined, so a size only counts if it has a widget
  const untouchedSlots = slots.filter((slot) => !selection[slot.size]);

  const selectedSlots: BayDashboardSlot[] = [];
  for (const size of bayDashboardWidgetSizes) {
    const choice = selection[size];
    if (!choice) continue;

    const existingSlot = slots.find((slot) => slot.size === size);
    selectedSlots.push({
      bayDashboardSlotId: existingSlot?.bayDashboardSlotId ?? `preview-${size}`,
      size,
      position: slotPositions[size],
      rotationSeconds: existingSlot?.rotationSeconds ?? 30,
      widgets: [{ bayDashboardWidgetId: `preview-${size}-0`, type: choice.type, order: 0, text: choice.text }]
    });
  }

  return [...untouchedSlots, ...selectedSlots].sort((a, b) => a.position - b.position);
};

/**
 * The text a size's text field widget displays.
 * The text selected in the selection for that size,
 * otherwise the text the TV is showing for that size.
 */
export const getTextFieldText = (
  slots: BayDashboardSlot[],
  selection: BayDashboardWidgetSelection,
  size: BayDashboardWidgetSize
): string | undefined => {
  const choice = selection[size];
  if (choice) return choice.type === BayDashboardWidgetType.TEXT_FIELD ? choice.text : undefined;

  const widget = slots.find((slot) => slot.size === size)?.widgets[0];
  return widget?.type === BayDashboardWidgetType.TEXT_FIELD ? widget.text : undefined;
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
