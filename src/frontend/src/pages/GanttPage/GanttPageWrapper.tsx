/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllProjects } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import { Task } from './GanttPackage/types/public-types';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { Project, WbsElementStatus, WorkPackage } from 'shared';
import GanttPage from './GanttPage';
import { projectWbsPipe, wbsPipe } from '../../utils/pipes';
import GanttPageFilter from './GanttPageFilter';
import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import { useQuery } from '../../hooks/utils.hooks';
import { useHistory } from 'react-router-dom';
import { filterGanttProjects, buildGanttSearchParams, GanttFilters } from '../../utils/gantt.utils';
import { routes } from '../../utils/routes';
import { useToast } from '../../hooks/toasts.hooks';

/**
 * Documentation for the Gantt package: https://github.com/MaTeMaTuK/gantt-task-react
 */
const GanttPageWrapper: FC = () => {
  const toast = useToast();
  const query = useQuery();
  const history = useHistory();
  const { isLoading, isError, data: projects, error } = useAllProjects();
  const [teamList, setTeamList] = useState<string[]>([]);
  const [ganttDisplayObjects, setGanttDisplayObjects] = useState<Task[]>([]);
  const showCar1 = query.get('showCar1') === 'true' || query.get('showCar1') === null;
  const showCar2 = query.get('showCar2') === 'true' || query.get('showCar2') === null;
  const status = query.get('status') || WbsElementStatus.Active.toString();
  const selectedTeam = query.get('selectedTeam') || 'All Teams';
  const queryStart = query.get('start');
  const queryEnd = query.get('end');
  const start = useMemo(() => {
    if (queryStart === 'null' || queryStart === null || queryStart === undefined) return null;
    return new Date(Date.parse(queryStart));
  }, [queryStart]);
  const end = useMemo(() => {
    if (queryEnd === 'null' || queryEnd === null || queryEnd === undefined) return null;
    return new Date(Date.parse(queryEnd));
  }, [queryEnd]);
  const expanded = query.get('expanded') ? query.get('expanded') === 'true' : false;

  const defaultGanttFilters: GanttFilters = {
    showCar1,
    showCar2,
    status,
    selectedTeam,
    expanded,
    start,
    end
  };

  const transformWPToGanttObject = (wp: WorkPackage, projects: Project[]): Task => {
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

  useEffect(() => {
    const transformProjectToGanttObject = (project: Project): Task => {
      const progress =
        (project.workPackages.filter((wp) => wp.status === WbsElementStatus.Complete).length / project.workPackages.length) *
        100;
      return {
        id: wbsPipe(project.wbsNum),
        name: wbsPipe(project.wbsNum) + ' ' + project.name,
        start: project.startDate || new Date(),
        end: project.endDate || new Date(),
        progress,
        type: 'project',
        hideChildren: !expanded,
        styles:
          progress === 100
            ? { progressColor: '#66bb6a', backgroundColor: '#66bb6a' }
            : { progressColor: '#e50000', backgroundColor: '#ff0000' },
        displayOrder: project.id,
        onClick: () => {
          window.open(`/projects/${wbsPipe(project.wbsNum)}`, '_blank');
        }
      };
    };
    if (projects) {
      const ganttFilters: GanttFilters = {
        showCar1,
        showCar2,
        status,
        selectedTeam,
        expanded,
        start,
        end
      };
      const filteredProjects = filterGanttProjects(projects, ganttFilters);
      const projTasks = filteredProjects.map(transformProjectToGanttObject);
      const workPackages = filteredProjects.flatMap((p) => p.workPackages);
      const wpTasks = workPackages.map((wp) => transformWPToGanttObject(wp, filteredProjects));
      setTeamList(Array.from(new Set(projects.map((p) => p.team?.teamName || 'No Team'))));
      setGanttDisplayObjects([...projTasks, ...wpTasks]);
    }
  }, [end, expanded, projects, showCar1, showCar2, start, status, selectedTeam]);

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const car1Handler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const car2Handler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar2: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const statusHandler = (event: SelectChangeEvent) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, status: event.target.value as string };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const teamHandler = (event: SelectChangeEvent) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, selectedTeam: event.target.value as string };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const expandedHandler = (value: boolean) => {
    // No more forced reloads
    if (value === expanded) {
      const newGanttDisplayObjects = ganttDisplayObjects.map((object) => {
        if (object.type === 'project') {
          return { ...object, hideChildren: !value };
        } else {
          return object;
        }
      });
      setGanttDisplayObjects(newGanttDisplayObjects);
    } else {
      const ganttFilters: GanttFilters = { ...defaultGanttFilters, expanded: value };
      history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
    }
  };

  const startHandler = (value: Date | null) => {
    if (value?.toString() === 'Invalid Date') return toast.error('Invalid Date', 2000);
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, start: value };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const endHandler = (value: Date | null) => {
    if (value?.toString() === 'Invalid Date') return toast.error('Invalid Date', 2000);
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, end: value };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const resetHandler = () => {
    // No more forced reloads
    if (query.get('expanded') === null) {
      const newGanttDisplayObjects = ganttDisplayObjects.map((object) => {
        if (object.type === 'project') {
          return { ...object, hideChildren: true };
        } else {
          return object;
        }
      });
      setGanttDisplayObjects(newGanttDisplayObjects);
    } else {
      history.push(routes.GANTT);
    }
  };

  return (
    <>
      <PageTitle previousPages={[]} title="Gantt Chart"></PageTitle>
      <GanttPageFilter
        car1Handler={car1Handler}
        car2Handler={car2Handler}
        status={status}
        statusHandler={statusHandler}
        teamHandler={teamHandler}
        startHandler={startHandler}
        endHandler={endHandler}
        expandedHandler={expandedHandler}
        teamList={teamList}
        selectedTeam={selectedTeam}
        currentStart={start}
        currentEnd={end}
        resetHandler={resetHandler}
      />
      <GanttPage ganttDisplayObjects={ganttDisplayObjects} updateGanttDisplayObjects={setGanttDisplayObjects} />
    </>
  );
};

export default GanttPageWrapper;
