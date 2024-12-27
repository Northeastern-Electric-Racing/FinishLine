/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageLayout from '../../components/PageLayout';
import BarChart from '../../components/StatsBarChart';
import PieChart from '../../components/StatsPieChart';
import LineGraph from '../../components/StatsLineGraph';
import { Box } from '@mui/material';

const StatisticsPage: React.FC = () => {
  // Testing bar, pie, and line chart components
  return (
    <PageLayout title="Statistics">
      <Box style={{ display: 'flex', justifyContent: 'normal' }}>
        <BarChart
          xAxisData={['test1', 'test2', 'test3', 'test4']}
          yAxisData={[100, 200, 50, 300]}
          xAxisLabel="Categories"
          yAxisLabel="Values"
          graphTitle="Bar Chart Test"
        />

        <Box style={{ padding: '50px' }} />

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
      </Box>

      <Box style={{ display: 'flex', justifyContent: 'normal' }}>
        <LineGraph
          xAxisData={['test1', 'test2', 'test3', 'test4']}
          yAxisData={[100, 200, 50, 500]}
          xAxisLabel="Categories"
          yAxisLabel="Values"
          graphTitle="Line graph Test"
        />
      </Box>
    </PageLayout>
  );
};

export default StatisticsPage;
