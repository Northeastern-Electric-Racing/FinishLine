/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import { BayDashboardSlot, BayDashboardWidgetSize } from 'shared';
import NERWidget from '../../../components/NERWidget';
import { bayDashboardWidgetDisplayNames } from '../../../utils/bay-dashboard.utils';

interface BayDashboardGridProps {
  slots: BayDashboardSlot[];
}

interface SlotCardProps {
  slot?: BayDashboardSlot;
  gridArea: string;
}

// titled frame for the slot's widget until the widget components exist
const SlotCard: React.FC<SlotCardProps> = ({ slot, gridArea }) => {
  const widget = slot?.widgets[0];

  return (
    <Box sx={{ gridArea, minWidth: 0, minHeight: 0 }}>
      <NERWidget title={widget && bayDashboardWidgetDisplayNames[widget.type]} />
    </Box>
  );
};

/**
 * The Big/Medium/Small widget grid the TV renders. Fills the width and height of its parent and
 * sizes text and spacing off its own width, so the parent decides the shape (the TV page uses the
 * whole screen, the Admin Tools preview keeps 16:9) and the preview is a scaled down copy of the TV.
 */
const BayDashboardGrid: React.FC<BayDashboardGridProps> = ({ slots }) => {
  const slotOfSize = (size: BayDashboardWidgetSize) => slots.find((slot) => slot.size === size);

  return (
    <Box sx={{ containerType: 'inline-size', width: '100%', height: '100%' }}>
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '6fr 42fr 28fr 18fr',
          gridTemplateAreas: `"header header" "large countdown" "large medium" "large small"`,
          gap: '2cqw',
          p: '2cqw',
          background: 'linear-gradient(to bottom, #000000 55%, #ef4244 140%)'
        }}
      >
        {/* weather and date/time go in "header", the countdown widget goes in "countdown" */}
        <SlotCard slot={slotOfSize(BayDashboardWidgetSize.LARGE)} gridArea="large" />
        <SlotCard slot={slotOfSize(BayDashboardWidgetSize.MEDIUM)} gridArea="medium" />
        <SlotCard slot={slotOfSize(BayDashboardWidgetSize.SMALL)} gridArea="small" />
      </Box>
    </Box>
  );
};

export default BayDashboardGrid;
