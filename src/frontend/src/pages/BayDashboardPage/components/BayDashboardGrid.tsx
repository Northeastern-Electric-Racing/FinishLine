/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import { BayDashboardWidgetSize, PublicBayDashboardSlot } from 'shared';
import { BAY_DASHBOARD_BACKGROUND, defaultBayDashboardSlots, widgetHeights } from '../../../utils/bay-dashboard.utils';
import BayDashboardWidgetView from './widgets/BayDashboardWidgetView';
interface BayDashboardGridProps {
  slots: PublicBayDashboardSlot[];
}

const gridAreas: Record<BayDashboardWidgetSize, string> = {
  [BayDashboardWidgetSize.LARGE]: 'large',
  [BayDashboardWidgetSize.MEDIUM]: 'medium',
  [BayDashboardWidgetSize.SMALL]: 'small'
};

// header, countdown, medium, small. Medium and small are the widget heights, and the large widget spans the last three
const MEDIUM_HEIGHT = widgetHeights[BayDashboardWidgetSize.MEDIUM];
const SMALL_HEIGHT = widgetHeights[BayDashboardWidgetSize.SMALL];
const gridRows = `60fr 380fr ${MEDIUM_HEIGHT}fr ${SMALL_HEIGHT}fr`;

/**
 * The Big/Medium/Small widget grid the TV renders. Fills the width of its parent at the TV's 16:9 shape,
 * so the preview is a scaled down copy of the TV.
 */
const BayDashboardGrid: React.FC<BayDashboardGridProps> = ({ slots }) => {
  return (
    <Box sx={{ containerType: 'inline-size', width: '100%' }}>
      <Box
        sx={{
          aspectRatio: '16 / 9',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: gridRows,
          gridTemplateAreas: `"header header" "large countdown" "large medium" "large small"`,
          gap: '2cqw',
          p: '2cqw',
          background: BAY_DASHBOARD_BACKGROUND
        }}
      >
        {/* weather and date/time go in "header", the countdown widget goes in "countdown" */}
        {defaultBayDashboardSlots.map(({ size, position, widgets: [defaultWidget] }) => {
          // fall back to the size's default widget when nothing is picked for it or the picked widget can't be shown
          const widget = slots.find((slot) => slot.size === size)?.widgets[0] ?? defaultWidget;

          return (
            <Box key={position} sx={{ gridArea: gridAreas[size], minWidth: 0, minHeight: 0 }}>
              <BayDashboardWidgetView widget={widget} size={size} fallbackWidget={defaultWidget} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default BayDashboardGrid;
