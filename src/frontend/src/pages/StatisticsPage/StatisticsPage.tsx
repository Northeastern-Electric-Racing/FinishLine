/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import PieChart from '../../components/StatsPieChart';

const StatisticsPage: React.FC = () => {
  return (
    <PageLayout title="Statistics">
      {
        <PieChart
          xAxisData={[
            'test1',
            'test2',
            'test3',
            'test4',
            'test5',
            'test6',
            'test7',
            'test8',
            'test9',
            'test10',
            'test11',
            'test12'
          ]}
          yAxisData={[10, 20, 5, 35, 15, 25, 10, 20, 5, 10, 12, 20]}
          graphTitle="Pie Chart Test"
        />
      }
      <Box></Box>
    </PageLayout>
  );
};

export default StatisticsPage;
