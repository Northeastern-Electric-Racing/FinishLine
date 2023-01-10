/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllProjects } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import { Task } from './GanttPackage/types/public-types';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { Project, WbsElementStatus, WorkPackage } from 'shared';
import GanttPage from './GanttPage';
import { projectWbsPipe, wbsPipe } from '../../utils/pipes';

/**
 * Documentation for the Gantt package: https://github.com/MaTeMaTuK/gantt-task-react
 */
const GanttPageWrapper: React.FC = () => {
  const { isLoading: projectIsLoading, isError: projectIsError, data: projects, error: projErr } = useAllProjects();
  const { isLoading: wpIsLoading, isError: wpIsError, data: workPackages, error: wpErr } = useAllWorkPackages();

  if (projectIsLoading || wpIsLoading || !projects || !workPackages) return <LoadingIndicator />;

  if (projectIsError) return <ErrorPage message={projErr?.message} />;

  if (wpIsError) return <ErrorPage message={wpErr?.message} />;

  const transformProjectToTask = (project: Project): Task => {
    return {
      id: wbsPipe(project.wbsNum),
      name: wbsPipe(project.wbsNum) + ' ' + project.name,
      start: project.startDate || new Date(),
      end: project.endDate || new Date(),
      progress:
        (project.workPackages.filter((wp) => wp.status === WbsElementStatus.Complete).length / project.workPackages.length) *
        100,
      type: 'project',
      hideChildren: true,
      styles: { progressColor: '#e50000', backgroundColor: '#ff0000' },
      displayOrder: project.id,
      onClick: () => {
        window.open(`/projects/${wbsPipe(project.wbsNum)}`, '_blank');
      }
    };
  };

  const transformWPToTask = (wp: WorkPackage, projects: Project[]): Task => {
    return {
      id: wbsPipe(wp.wbsNum), // Avoid conflict with project ids
      name: wbsPipe(wp.wbsNum) + ' ' + wp.name,
      start: wp.startDate,
      end: wp.endDate,
      progress: wp.progress,
      project: projectWbsPipe(wp.wbsNum),
      type: 'task',
      styles: { progressColor: '#9c9c9c', backgroundColor: '#c4c4c4' },
      displayOrder: projects.find((p) => p.workPackages.find((w) => w.id === wp.id))!.id,
      onClick: () => {
        window.open(`/projects/${wbsPipe(wp.wbsNum)}`, '_blank');
      }
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
