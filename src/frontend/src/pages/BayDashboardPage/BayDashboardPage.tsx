/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useBayDashboardEvents } from '../../hooks/bay-dashboard.hooks';

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
    <Box>
      <Typography variant="body2">Bay Dashboard</Typography>
    </Box>
  );
};

export default BayDashboardPage;
