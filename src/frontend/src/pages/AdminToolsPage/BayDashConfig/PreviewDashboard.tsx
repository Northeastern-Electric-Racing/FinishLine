/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
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
}

const frameSx = { border: '2px solid white', borderRadius: '4px', width: '100%', aspectRatio: '16 / 9' };

/**
 * Scaled down copy of what the TV in the bay is currently displaying, with the widget picked for each
 * size in the right column swapped in. A size with nothing picked shows what the TV has.
 */
const PreviewDashboard: React.FC<PreviewDashboardProps> = ({ selection }) => {
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
      <BayDashboardGrid slots={applyWidgetSelection(config?.slots ?? defaultBayDashboardSlots, selection)} />
    </Box>
  );
};

export default PreviewDashboard;
