/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Theme, Typography } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import PreviewDashboard from './PreviewDashboard';
import WidgetSelection from './WidgetSelection';

const widgetBoxSx: SystemStyleObject<Theme> = {
  bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300]),
  borderRadius: 4,
  minWidth: 300
};

/**
 * The Bay Dashboard tab in Admin Tools
 */
const AdminToolsBayDashConfig: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gridTemplateRows: { md: 'repeat(3, 1fr)' },
        gap: 4,
        p: 2,
        boxSizing: 'border-box',
        width: '100%',
        aspectRatio: { md: '16 / 10' }
      }}
    >
      <Box
        sx={{
          ...widgetBoxSx,
          gridColumn: { md: 'span 2' },
          gridRow: { md: 'span 2' },
          minHeight: { xs: 240, md: 0 },
          p: 2
        }}
      >
        <Typography variant="h5" gutterBottom pl={1}>
          Preview
        </Typography>
        <PreviewDashboard />
      </Box>
      <Box
        sx={{
          ...widgetBoxSx,
          gridColumn: { md: 3 },
          gridRow: { md: '1 / span 3' },
          minHeight: { xs: 320, md: 0 },
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto'
        }}
      >
        <WidgetSelection />
      </Box>
    </Box>
  );
};

export default AdminToolsBayDashConfig;
