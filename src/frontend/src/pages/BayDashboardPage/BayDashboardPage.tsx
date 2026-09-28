/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import NERWidget, { WidgetSize } from './components/NERWidget';

/**
 * The public bay dashboard, displayed on the TV in the bay.
 */
const BayDashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="body2">Bay Dashboard</Typography>
      {/* <NERWidget title={'testing'}> </NERWidget> */}
      <NERWidget title={'Widget Title Bar'} size={WidgetSize.LARGE}>
        {' '}
      </NERWidget>
      <NERWidget title={'Widget Title Bar'} size={WidgetSize.MEDIUM}>
        {' '}
      </NERWidget>
      <NERWidget title={'Widget Title Bar'} size={WidgetSize.SMALL}>
        {' '}
      </NERWidget>
      {/* test each size w title */}
    </Box>
  );
};

export default BayDashboardPage;
