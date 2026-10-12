/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { BayDashboardWidgetSize } from 'shared';

interface NERWidgetProps {
  size: BayDashboardWidgetSize;
  title?: string;
  children?: React.ReactNode;
}

/**
 * Shared container for a single bay dashboard widget.
 * Used by both the public TV grid and the Admin Tools preview.
 */
const NERWidget: React.FC<NERWidgetProps> = ({ title, size, children }) => {
  //scaled variable(s) for box, default is medium
  const WidgetWidth = '46vw';

  const WidgetHeight =
    size === BayDashboardWidgetSize.SMALL
      ? '15vh'
      : size === BayDashboardWidgetSize.MEDIUM
        ? '30vh'
        : size === BayDashboardWidgetSize.LARGE
          ? '75vh'
          : '30vh';

  const WidgetPadding =
    size === BayDashboardWidgetSize.SMALL
      ? 2
      : size === BayDashboardWidgetSize.MEDIUM
        ? 3
        : size === BayDashboardWidgetSize.LARGE
          ? 4
          : 3;

  const TitleFontSize = '20px';
  return (
    <Box
      sx={{
        width: WidgetWidth,
        height: WidgetHeight,
        borderRadius: '8px',
        bgcolor: 'rgba(255, 255, 255, 0.2)', //bg color and opacity
        opacity: '1', //text opacity
        padding: WidgetPadding, //scales with the widget size
        border: '1.5px solid rgba(255,255,255,0.15)',
        overflow: 'hidden'
      }}
    >
      <Typography
        sx={{
          fontSize: TitleFontSize,
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
};

export default NERWidget;
