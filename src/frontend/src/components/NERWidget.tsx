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
const NERWidget: React.FC<NERWidgetProps> = ({ title, children }) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: '2cqw',
        bgcolor: 'rgba(255, 255, 255, 0.2)', //bg color and opacity
        padding: '2cqw',
        border: '1.5px solid rgba(255,255,255,0.15)',
        overflow: 'hidden'
      }}
    >
      {title && (
        <Typography
          variant="h6"
          sx={{
            fontSize: '2cqw',
            fontWeight: '100',
            color: 'white'
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
};

export default NERWidget;
