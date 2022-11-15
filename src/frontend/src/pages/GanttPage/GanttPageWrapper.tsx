/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllProjects } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import { Task } from 'gantt-task-react';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { projectDurationBuilder } from 'shared/src/backend-supports/projects-get-all';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { Project, WorkPackage } from 'shared';
import GanttPage from './GanttPage';

const transformProjectToTask = (project: Project): Task => {
  return {
    id: project.id.toString(),
    name: project.name,
    start:
      project.workPackages.length > 0
        ? project.workPackages
            .map((wp) => wp.startDate)
            .reduce(function (a, b) {
              return a < b ? a : b;
            })
        : new Date(),
    end: new Date(new Date().setDate(new Date().getDate() + 7 * projectDurationBuilder(project.workPackages))),
    progress: 10,
    type: 'project',
    hideChildren: true,
    styles: { progressColor: '#ff0000', backgroundColor: '#c4c4c4' },
    displayOrder: project.id
  };
};

const transformWPToTask = (wp: WorkPackage, projects: Project[]): Task => {
  return {
    id: wp.id.toString(),
    name: wp.name,
    start: wp.startDate,
    end: wp.endDate,
    progress: wp.progress,
    project: projects!.find((p) => p.workPackages.find((w) => w.id === wp.id))!.id.toString(),
    type: 'task',
    styles: { progressColor: '#ff0000', backgroundColor: '#c4c4c4' },
    displayOrder: projects!.find((p) => p.workPackages.find((w) => w.id === wp.id))!.id
  };
};

/**
 * Documentation for the Gantt package: https://github.com/MaTeMaTuK/gantt-task-react
 */
const GanttPageWrapper: React.FC = () => {
  const { isLoading: projectIsLoading, isError: projectIsError, data: projects, error: projErr } = useAllProjects();
  const { isLoading: wpIsLoading, isError: wpIsError, data: workPackages, error: wpErr } = useAllWorkPackages();

  if (projectIsLoading || wpIsLoading || !projects || !workPackages) return <LoadingIndicator />;

  if (projectIsError) return <ErrorPage message={projErr?.message} />;

  if (wpIsError) return <ErrorPage message={wpErr?.message} />;

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
