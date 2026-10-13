/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetCurrentBayDashboardConfig } from '../../../hooks/bay-dashboard.hooks';
import {
  applyWidgetSelection,
  BayDashboardWidgetSelection,
  defaultBayDashboardSlots
} from '../../../utils/bay-dashboard.utils';
import ErrorPage from '../../ErrorPage';
import BayDashboardGrid from '../../BayDashboardPage/components/BayDashboardGrid';

interface PreviewDashboardProps {
  selection: BayDashboardWidgetSelection;
}

/**
 * Scaled down copy of what the TV in the bay is currently displaying, with the widget picked for each
 * size in the right column swapped in. A size with nothing picked shows what the TV has.
 */
const PreviewDashboard: React.FC<PreviewDashboardProps> = ({ selection }) => {
  const { data: config, isLoading, isError, error } = useGetCurrentBayDashboardConfig();

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || config === undefined) return <LoadingIndicator />;

  return (
    <Box sx={{ border: '3px solid white' }}>
      <BayDashboardGrid slots={applyWidgetSelection(config?.slots ?? defaultBayDashboardSlots, selection)} />
    </Box>
  );
};

export default PreviewDashboard;
