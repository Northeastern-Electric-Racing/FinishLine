/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useBayDashboardEvents } from '../../hooks/bay-dashboard.hooks';
import { defaultBayDashboardSlots } from '../../utils/bay-dashboard.utils';
import BayDashboardGrid from './components/BayDashboardGrid';

interface ParamTypes {
  slug: string;
}

/**
 * The public bay dashboard, displayed on the TV in the bay.
 */
const BayDashboardPage: React.FC = () => {
  const { slug } = useParams<ParamTypes>();

  useBayDashboardEvents(slug);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        bgcolor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box sx={{ width: 'min(100vw, calc(100vh * 16 / 9))' }}>
        {/* TODO: display the most recent saved config so the TV matches the Admin Tools preview, instead of the defaults */}
        <BayDashboardGrid slots={defaultBayDashboardSlots} />
      </Box>
    </Box>
  );
};

export default BayDashboardPage;
