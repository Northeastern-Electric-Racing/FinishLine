/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chart from 'react-google-charts';
import { WorkPackage } from 'shared';
import { ganttAllColumns } from '../../../../chart-data';
import PageBlock from '../../../../layouts/page-block/page-block';

interface ProjectGanttProps {
  workPackages: WorkPackage[];
}

const ProjectGantt: React.FC<ProjectGanttProps> = ({ workPackages }) => {
  const rows = workPackages.map((wp) => [
    wp.id,
    wp.name,
    wp.startDate,
    wp.endDate,
    wp.duration,
    wp.progress,
    null
  ]);
  const data = [ganttAllColumns, ...rows];
  const options = {
    height: 30 * rows.length + 50,
    gantt: {
      trackHeight: 30,
      barHeight: 20,
      labelStyle: {
        fontName: 'Oswald',
        fontSize: 14
      }
    }
  };
  return (
    <PageBlock title={'Gantt Chart'}>
      {workPackages.length > 0 ? (
        <Chart chartType="Gantt" width="100%" height="100%" data={data} options={options} />
      ) : (
        ''
      )}
    </PageBlock>
  );
};

export default ProjectGantt;
