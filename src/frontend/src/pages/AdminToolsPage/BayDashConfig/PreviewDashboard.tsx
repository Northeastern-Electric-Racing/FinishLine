/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetCurrentBayDashboardConfig } from '../../../hooks/bay-dashboard.hooks';
import {
  applyWidgetSelection,
  BAY_DASHBOARD_BACKGROUND,
  BayDashboardWidgetSelection,
  defaultBayDashboardSlots
} from '../../../utils/bay-dashboard.utils';
import ErrorPage from '../../ErrorPage';
import BayDashboardGrid from '../../BayDashboardPage/components/BayDashboardGrid';

interface PreviewDashboardProps {
  selection: BayDashboardWidgetSelection;
  onEditText: (size: BayDashboardWidgetSize) => void;
}

const frameSx = { border: '2px solid white', borderRadius: '4px', width: '100%', aspectRatio: '16 / 9' };

/**
 * Scaled down copy of what the TV in the bay is currently displaying, with the widget picked for each
 * size in the right column swapped in. A size with nothing picked shows what the TV has.
 * Text field widgets have an edit button for changing their text.
 */
const PreviewDashboard: React.FC<PreviewDashboardProps> = ({ selection, onEditText }) => {
  const { data: config, isLoading, isError, error } = useGetCurrentBayDashboardConfig();

  if (isError || isLoading || config === undefined) {
    return (
      <Box
        sx={{
          ...frameSx,
          background: BAY_DASHBOARD_BACKGROUND,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ '& > div': { pt: 0 } }}>{isError ? <ErrorPage message={error.message} /> : <LoadingIndicator />}</Box>
      </Box>
    );
  }

  return (
    <Box sx={frameSx}>
      <BayDashboardGrid
        slots={applyWidgetSelection(config?.slots ?? defaultBayDashboardSlots, selection)}
        renderSlotAction={(size, widget) =>
          widget.type === BayDashboardWidgetType.TEXT_FIELD && (
            <IconButton
              aria-label="Edit text field text"
              size="small"
              onClick={() => onEditText(size)}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.6)' }
              }}
            >
              <Edit fontSize="inherit" />
            </IconButton>
          )
        }
      />
    </Box>
  );
};

export default PreviewDashboard;
