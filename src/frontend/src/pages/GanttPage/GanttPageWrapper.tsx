/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllProjects } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { WbsElementStatus } from 'shared';
import GanttChart from './GanttChart';
import GanttPageFilter from './GanttPageFilter';
import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import { useQuery } from '../../hooks/utils.hooks';
import { useHistory } from 'react-router-dom';
import {
  filterGanttProjects,
  buildGanttSearchParams,
  GanttFilters,
  NO_TEAM,
  sortTeamNames,
  GanttTask,
  transformProjectToGanttTask
} from '../../utils/gantt.utils';
import { routes } from '../../utils/routes';
import { useToast } from '../../hooks/toasts.hooks';
import { Box, createTheme, Paper, ThemeProvider, Typography } from '@mui/material';
import { nerThemeOptions, lightThemeOptions } from '../../utils/themes';

/**
 * Documentation for the Gantt package: https://github.com/MaTeMaTuK/gantt-task-react
 */
const GanttPageWrapper: FC = () => {
  const toast = useToast();
  const query = useQuery();
  const history = useHistory();
  const { isLoading, isError, data: projects, error } = useAllProjects();
  const [teamList, setTeamList] = useState<string[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const showCar0 = query.get('showCar0') === 'true' || query.get('showCar0') === null;
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
    showCar0,
    showCar1,
    showCar2,
    status,
    selectedTeam,
    expanded,
    start,
    end
  };

  useEffect(() => {
    if (!projects) return;

    setTeamList(Array.from(new Set(projects.map((p) => p.team?.teamName || NO_TEAM))));

    const ganttFilters: GanttFilters = {
      showCar0,
      showCar1,
      showCar2,
      status,
      selectedTeam,
      expanded,
      start,
      end
    };

    const filteredProjects = filterGanttProjects(projects, ganttFilters);
    const sortedProjects = filteredProjects.sort(
      (a, b) => (a.startDate || new Date()).getTime() - (b.startDate || new Date()).getTime()
    );
    const tasks: GanttTask[] = sortedProjects.flatMap((project) => transformProjectToGanttTask(project, expanded));

    setGanttTasks(tasks);
  }, [end, expanded, projects, showCar0, showCar1, showCar2, start, status, selectedTeam]);

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const car0Handler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar0: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

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
      const newGanttTasks = ganttTasks.map((task) => {
        if (task.type === 'project') {
          return { ...task, hideChildren: !value };
        } else {
          return task;
        }
      });
      setGanttTasks(newGanttTasks);
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
      const newGanttDisplayObjects = ganttTasks.map((object) => {
        if (object.type === 'project') {
          return { ...object, hideChildren: true };
        } else {
          return object;
        }
      });
      setGanttTasks(newGanttDisplayObjects);
    } else {
      history.push(routes.GANTT);
    }
  };

  const teamNameToGanttTasksMap = new Map<string, GanttTask[]>();

  ganttTasks.forEach((ganttTask) => {
    const tasks: GanttTask[] = teamNameToGanttTasksMap.get(ganttTask.teamName) || [];
    tasks.push(ganttTask);
    teamNameToGanttTasksMap.set(ganttTask.teamName, tasks);
  });

  const sortedTeamList: string[] = teamList.sort(sortTeamNames);

  const ganttCharts: JSX.Element[] = sortedTeamList.map((teamName: string) => {
    const tasks = teamNameToGanttTasksMap.get(teamName);
    if (!tasks) return <></>;

    return (
      <Box key={teamName} sx={{ my: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            {teamName}
          </Typography>
        </Box>
        <Paper>
          <GanttChart
            ganttTasks={tasks}
            onExpanderClick={(newTask) => {
              const newTasks = ganttTasks.map((task) => (newTask.id === task.id ? { ...newTask, teamName } : task));
              setGanttTasks(newTasks);
            }}
          />
        </Paper>
      </Box>
    );
  });

  return (
    <>
      <PageTitle previousPages={[]} title="Gantt Chart"></PageTitle>
      <GanttPageFilter
        car0Handler={car0Handler}
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
      <ThemeProvider theme={createTheme(nerThemeOptions, lightThemeOptions)}>{ganttCharts}</ThemeProvider>
    </>
  );
};

export default GanttPageWrapper;
