/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { BayDashboardWidgetSize } from 'shared';
import { WIDGET_WIDTH, widgetHeights } from '../utils/bay-dashboard.utils';

interface NERWidgetProps {
  size: BayDashboardWidgetSize;
  title?: string;
  children?: React.ReactNode;
}

/**
 * Shared container for a single bay dashboard widget.
 * Every widget of a size is the same shape wherever it's shown (the TV, the Admin Tools preview, the widget dropdowns).
 */
const NERWidget: React.FC<NERWidgetProps> = ({ size, title, children }) => {
  return (
    <Box
      sx={{
        containerType: 'inline-size',
        width: '100%',
        aspectRatio: `${WIDGET_WIDTH} / ${widgetHeights[size]}`
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '4cqw',
          bgcolor: 'rgba(255, 255, 255, 0.2)',
          padding: '4cqw',
          border: '1.5px solid rgba(255,255,255,0.15)',
          overflow: 'hidden',
          // lets a widget's content fill the space under the title
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {title && (
          <Typography
            variant="h6"
            sx={{
              fontSize: '4cqw',
              fontWeight: '100',
              color: 'white'
            }}
          >
            {title}
          </Typography>
        )}
        {children}
      </Box>
    </Box>
  );
};

export default NERWidget;
