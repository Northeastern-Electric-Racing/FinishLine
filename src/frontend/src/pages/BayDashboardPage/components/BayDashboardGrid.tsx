/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { BayDashboardSlot, BayDashboardWidgetSize } from 'shared';
import { bayDashboardWidgetDisplayNames } from '../../../utils/bay-dashboard.utils';

interface BayDashboardGridProps {
  slots: BayDashboardSlot[];
}

interface SlotCardProps {
  slot?: BayDashboardSlot;
  gridArea: string;
}

// stands in for the slot's widget until the widget components exist
const SlotCard: React.FC<SlotCardProps> = ({ slot, gridArea }) => {
  const widget = slot?.widgets[0];

  return (
    <Box
      sx={{
        gridArea,
        borderRadius: '3cqw',
        bgcolor: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        p: '1.5cqw',
        overflow: 'hidden'
      }}
    >
      {widget && (
        <Typography sx={{ color: 'white', fontSize: '2.5cqw' }}>{bayDashboardWidgetDisplayNames[widget.type]}</Typography>
      )}
    </Box>
  );
};

/**
 * The Big/Medium/Small widget grid the TV renders. Fills the width of its parent at 16:9 and sizes
 * everything off that width, so the Admin Tools preview is a scaled down copy of the TV.
 */
const BayDashboardGrid: React.FC<BayDashboardGridProps> = ({ slots }) => {
  const slotOfSize = (size: BayDashboardWidgetSize) => slots.find((slot) => slot.size === size);

  return (
    <Box sx={{ containerType: 'inline-size', width: '100%' }}>
      <Box
        sx={{
          aspectRatio: '16 / 9',
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
