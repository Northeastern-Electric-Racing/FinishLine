/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import LoadingIndicator from '../components/LoadingIndicator';
import { useAllProjects } from '../hooks/Projects.hooks';
import styles from '../stylesheets/pages/TeamsPage.module.css';
import ErrorPage from './ErrorPage';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useAllWorkPackages } from '../hooks/WorkPackages.hooks';
import { projectDurationBuilder } from 'shared/src/backend-supports/projects-get-all';

/**
 * Documentation for the Gantt package: https://github.com/MaTeMaTuK/gantt-task-react
 */
const GanttPage: React.FC = () => {
  const {
    isLoading: projectIsLoading,
    isError: projectIsError,
    data: projects,
    error: projErr
  } = useAllProjects();
  const {
    isLoading: wpIsLoading,
    isError: wpIsError,
    data: workPackages,
    error: wpErr
  } = useAllWorkPackages();

  if (projectIsLoading || wpIsLoading || !workPackages || !projects) return <LoadingIndicator />;

  if (projectIsError) return <ErrorPage message={projErr?.message} />;

  if (wpIsError) return <ErrorPage message={wpErr?.message} />;

  const projTasks: Task[] = projects?.map((project) => {
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
      end: new Date(
        new Date().setDate(new Date().getDate() + 7 * projectDurationBuilder(project.workPackages))
      ),
      progress: 10,
      type: 'project'
    };
  });

  const wpTasks: Task[] = workPackages.map((wp) => {
    return {
      id: wp.id.toString(),
      name: wp.name,
      start: wp.startDate,
      end: wp.endDate,
      progress: wp.progress,
      project: projects.find((p) => p.workPackages.find((w) => w.id === wp.id))!.id.toString(),
      type: 'task'
    };
  });

  const viewMode: ViewMode = ViewMode.Month;

  const tasks = projTasks.concat(wpTasks);

  return (
    <div className={`pt-5 ${styles.page_not_found}`}>
      <Gantt tasks={tasks} viewMode={viewMode} preStepsCount={1} locale={'US'} />
      <Gantt
        tasks={tasks}
        viewMode={viewMode}
        locale={'US'}
        viewDate={new Date()}
        TaskListHeader={() => {
          return <></>;
        }}
        TaskListTable={() => {
          return <></>;
        }}
      />
    </div>
  );
};

export default GanttPage;
