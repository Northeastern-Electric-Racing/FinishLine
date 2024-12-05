/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageLayout from '../../components/PageLayout';
import BarChart from '../../components/StatsBarChart';

const StatisticsPage: React.FC = () => {
  // Testing bar chart component
  return (
    <PageLayout title="Statistics">
      <BarChart
        xAxisData={['test1', 'test2', 'test3', 'test4']}
        yAxisData={[100, 200, 50, 300]}
        xAxisLabel="Categories"
        yAxisLabel="Values"
        graphTitle="Statistics Overview"
      />
    </PageLayout>
  );
};

export default StatisticsPage;
