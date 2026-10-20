import { Bay_Dashboard_Widget_Size, Bay_Dashboard_Widget_Type } from '@prisma/client';

// every widget type in the schema must be listed here; widgets that haven't been built yet have no sizes
export const widgetDetails: Record<Bay_Dashboard_Widget_Type, { displayName: string; sizes: Bay_Dashboard_Widget_Size[] }> =
  {
    CALENDAR: {
      displayName: 'Calendar',
      sizes: [Bay_Dashboard_Widget_Size.LARGE, Bay_Dashboard_Widget_Size.MEDIUM]
    },
    OVERDUE_WORK_PACKAGES: {
      displayName: 'Overdue Work Packages',
      sizes: [Bay_Dashboard_Widget_Size.LARGE, Bay_Dashboard_Widget_Size.MEDIUM, Bay_Dashboard_Widget_Size.SMALL]
    },
    TEXT_FIELD: {
      displayName: 'Text Field',
      sizes: [Bay_Dashboard_Widget_Size.LARGE, Bay_Dashboard_Widget_Size.MEDIUM, Bay_Dashboard_Widget_Size.SMALL]
    },
    TIER_LIST: { displayName: 'Tier List', sizes: [] },
    MBTA_TRACKER: { displayName: 'MBTA Tracker', sizes: [] },
    SLACK_APPRECIATIONS: { displayName: 'Appreciations', sizes: [] },
    SLACK_MENTIONS: { displayName: '@bay-dashboard', sizes: [] }
  };
