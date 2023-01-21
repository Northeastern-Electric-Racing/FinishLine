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

export const filterGanttProjects = (
  projects: Project[],
  showCar1: boolean,
  showCar2: boolean,
  status: string,
  team: string,
  start: Date | null,
  end: Date | null
): Project[] => {
  const car1Check = (project: Project) => {
    return project.wbsNum.carNumber !== 1;
  };
  const car2Check = (project: Project) => {
    return project.wbsNum.carNumber !== 2;
  };
  const statusCheck = (project: Project) => {
    return project.status.toString() === status;
  };
  const teamCheck = (project: Project) => {
    return project.team?.teamName === team;
  };
  const startCheck = (project: Project) => {
    return project.startDate && start ? project.startDate >= start : false;
  };
  const endCheck = (project: Project) => {
    return project.endDate && end ? project.endDate <= end : false;
  };
  if (!showCar1) {
    projects = projects.filter(car1Check);
  }
  if (!showCar2) {
    projects = projects.filter(car2Check);
  }
  if (status !== 'All Statuses') {
    projects = projects.filter(statusCheck);
  }
  if (team !== 'All Teams') {
    projects = projects.filter(teamCheck);
  }
  if (start) {
    projects = projects.filter(startCheck);
  }
  if (end) {
    projects = projects.filter(endCheck);
  }
  return projects;
};

/**
 * Documentation for the Gantt package: https://github.com/MaTeMaTuK/gantt-task-react
 */
const GanttPageWrapper: FC = () => {
  const query = useQuery();
  const history = useHistory();
  const { isLoading, isError, data: projects, error } = useAllProjects();
  const [teamList, setTeamList] = useState<string[]>([]);
  const [ganttDisplayObjects, setGanttDisplayObjects] = useState<Task[]>([]);
  const showCar1 = query.get('showCar1') ? query.get('showCar1') === 'true' : true;
  const showCar2 = query.get('showCar2') ? query.get('showCar2') === 'true' : true;
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
  console.log('start', start);
  console.log('queryStart', queryStart);
  console.log('end', end);
  console.log('queryEnd', queryEnd);
  const expanded = query.get('expanded') ? query.get('expanded') === 'true' : false;

  useEffect(() => {
    const transformProjectToGanttObject = (project: Project): Task => {
      return {
        id: wbsPipe(project.wbsNum),
        name: wbsPipe(project.wbsNum) + ' ' + project.name,
        start: project.startDate || new Date(),
        end: project.endDate || new Date(),
        progress:
          (project.workPackages.filter((wp) => wp.status === WbsElementStatus.Complete).length /
            project.workPackages.length) *
          100,
        type: 'project',
        hideChildren: !expanded,
        styles: { progressColor: '#e50000', backgroundColor: '#ff0000' },
        displayOrder: project.id,
        onClick: () => {
          window.open(`/projects/${wbsPipe(project.wbsNum)}`, '_blank');
        }
      };
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
    if (projects) {
      const filteredProjects = filterGanttProjects(projects, showCar1, showCar2, status, selectedTeam, start, end);
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
    const searchParams = `?status=${status}&showCar1=${event.target.checked}&showCar2=${showCar2}&selectedTeam=${selectedTeam}&expanded=${expanded}&start=${start}&end=${end}`;
    history.push(`${history.location.pathname + searchParams}`);
  };

  const car2Handler = (event: ChangeEvent<HTMLInputElement>) => {
    const searchParams = `?status=${status}&showCar1=${showCar1}&showCar2=${event.target.checked}&selectedTeam=${selectedTeam}&expanded=${expanded}&start=${start}&end=${end}`;
    history.push(`${history.location.pathname + searchParams}`);
  };

  const statusHandler = (event: SelectChangeEvent) => {
    const searchParams = `?status=${
      event.target.value as string
    }&showCar1=${showCar1}&showCar2=${showCar2}&selectedTeam=${selectedTeam}&expanded=${expanded}&start=${start}&end=${end}`;
    history.push(`${history.location.pathname + searchParams}`);
  };
  const teamHandler = (event: SelectChangeEvent) => {
    const searchParams = `?status=${status}&showCar1=${showCar1}&showCar2=${showCar2}&selectedTeam=${
      event.target.value as string
    }&expanded=${expanded}&start=${start}&end=${end}`;
    history.push(`${history.location.pathname + searchParams}`);
  };
  const startHandler = (value: Date | null) => {
    const dateString = value?.toISOString();
    const searchParams = `?status=${status}&showCar1=${showCar1}&showCar2=${showCar2}&selectedTeam=${selectedTeam}&expanded=${expanded}&start=${
      dateString ?? null
    }&end=${end}`;
    history.push(`${history.location.pathname + searchParams}`);
  };
  const endHandler = (value: Date | null) => {
    const dateString = value?.toISOString();
    const searchParams = `?status=${status}&showCar1=${showCar1}&showCar2=${showCar2}&selectedTeam=${selectedTeam}&expanded=${expanded}&start=${start}&end=${
      dateString ?? null
    }`;
    history.push(`${history.location.pathname + searchParams}`);
  };
  const expandedHandler = (value: boolean) => {
    const searchParams = `?status=${status}&showCar1=${showCar1}&showCar2=${showCar2}&selectedTeam=${selectedTeam}&expanded=${value}&start=${start}&end=${end}`;
    history.push(`${history.location.pathname + searchParams}`);
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
      />
      <GanttPage ganttDisplayObjects={ganttDisplayObjects} />
    </>
  );
};

export default GanttPageWrapper;
