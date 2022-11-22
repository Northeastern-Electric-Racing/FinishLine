/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllProjects } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import { Task } from './temp/types/public-types';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { Project, WbsElementStatus, WorkPackage } from 'shared';
import GanttPage from './GanttPage';
import { wbsPipe } from '../../utils/Pipes';
import { useHistory } from 'react-router-dom';

/**
 * Documentation for the Gantt package: https://github.com/MaTeMaTuK/gantt-task-react
 */
const GanttPageWrapper: React.FC = () => {
  const { isLoading: projectIsLoading, isError: projectIsError, data: projects, error: projErr } = useAllProjects();
  const { isLoading: wpIsLoading, isError: wpIsError, data: workPackages, error: wpErr } = useAllWorkPackages();

  const history = useHistory();

  if (projectIsLoading || wpIsLoading || !projects || !workPackages) return <LoadingIndicator />;

  if (projectIsError) return <ErrorPage message={projErr?.message} />;

  if (wpIsError) return <ErrorPage message={wpErr?.message} />;

  const transformProjectToTask = (project: Project): Task => {
    return {
      id: project.id.toString(),
      name: wbsPipe(project.wbsNum) + ' ' + project.name,
      start: project.startDate || new Date(),
      end: project.endDate || new Date(),
      progress:
        (project.workPackages.filter((wp) => wp.status === WbsElementStatus.Complete).length / project.workPackages.length) *
        100,
      type: 'project',
      hideChildren: true,
      styles: { progressColor: '#ff0000', backgroundColor: '#c4c4c4' },
      displayOrder: project.id,
      onClick: () => {
        history.push(`/projects/${wbsPipe(project.wbsNum)}`);
      }
    };
  };

  const transformWPToTask = (wp: WorkPackage, projects: Project[]): Task => {
    return {
      id: wp.id.toString() + wbsPipe(wp.wbsNum), // Avoid conflict with project ids
      name: wbsPipe(wp.wbsNum) + ' ' + wp.name,
      start: wp.startDate,
      end: wp.endDate,
      progress: wp.progress,
      project: projects.find((p) => p.workPackages.find((w) => w.id === wp.id))!.id.toString(),
      type: 'task',
      styles: { progressColor: '#ff0000', backgroundColor: '#c4c4c4' },
      displayOrder: projects.find((p) => p.workPackages.find((w) => w.id === wp.id))!.id,
      onClick: () => {
        history.push(`/projects/${wbsPipe(wp.wbsNum)}`);
      },
      dependencies: wp.dependencies.map((d) => wp.id.toString() + wbsPipe(wp.wbsNum))
    };
  };

  const projTasks = projects.map(transformProjectToTask);

  const wpTasks = workPackages.map((wp) => transformWPToTask(wp, projects));

  const tasks = [...projTasks, ...wpTasks];

  return (
    <>
      <PageTitle previousPages={[]} title="Gantt Chart"></PageTitle>
      <GanttPage tasks={tasks} />
    </>
  );
};

export default GanttPageWrapper;
