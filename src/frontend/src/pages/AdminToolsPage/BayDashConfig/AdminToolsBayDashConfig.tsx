/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Theme, Typography } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { useState } from 'react';
import { NERButton } from '../../../components/NERButton';
import { useGetCurrentBayDashboardConfig, useSaveBayDashboardConfig } from '../../../hooks/bay-dashboard.hooks';
import {
  applyWidgetSelection,
  BayDashboardWidgetSelection,
  toSlotCreateArgs
} from '../../../utils/bay-dashboard.utils';
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
  const [selection, setSelection] = useState<BayDashboardWidgetSelection>({});
  const hasSelection = Object.values(selection).some((type) => type);
  const { data: config } = useGetCurrentBayDashboardConfig();
  const { mutate: save, isLoading: isSaving } = useSaveBayDashboardConfig();

  const handleSave = () => {
    save(toSlotCreateArgs(applyWidgetSelection(config?.slots ?? [], selection)), { onSuccess: () => setSelection({}) });
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gridTemplateRows: { md: 'auto auto 1fr' },
        gap: 4,
        rowGap: 2,
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
          gridRow: { md: 1 },
          minHeight: { xs: 240, md: 0 },
          p: 2
        }}
      >
        <Typography variant="h5" gutterBottom pl={1}>
          Preview
        </Typography>
        <PreviewDashboard selection={selection} />
      </Box>
      <Box sx={{ gridColumn: { md: 'span 2' }, gridRow: { md: 2 }, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <NERButton variant="contained" disabled={!hasSelection} onClick={() => setSelection({})}>
          CLEAR
        </NERButton>
        <NERButton variant="contained" disabled={!hasSelection || config === undefined || isSaving} onClick={handleSave}>
          SAVE
        </NERButton>
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
        <WidgetSelection selection={selection} onSelectionChange={setSelection} />
      </Box>
    </Box>
  );
};

export default AdminToolsBayDashConfig;
