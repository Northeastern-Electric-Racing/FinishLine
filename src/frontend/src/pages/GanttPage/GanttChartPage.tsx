/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllProjects } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import { add, sub } from 'date-fns';
import { useQuery } from '../../hooks/utils.hooks';
import { useHistory } from 'react-router-dom';
import {
  filterGanttProjects,
  buildGanttSearchParams,
  GanttFilters,
  sortTeamNames,
  GanttTask,
  transformProjectToGanttTask,
  getProjectTeamsName,
  EventChange
} from '../../utils/gantt.utils';
import { routes } from '../../utils/routes';
import { Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { GanttChartTimeline } from './GanttChartComponents/GanttChartTimeline';
import { SearchBar } from '../../components/SearchBar';
import GanttChartColorLegend from './GanttChartComponents/GanttChartColorLegend';
import GanttChartFiltersButton from './GanttChartComponents/GanttChartFiltersWrapper';
import GanttChart from './GanttChartComponents/GanttChart';

const GanttChartPage: FC = () => {
  const query = useQuery();
  const history = useHistory();
  const { isLoading, isError, data: projects, error } = useAllProjects();
  const [teamList, setTeamList] = useState<string[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [chartEditingState, setChartEditingState] = React.useState<
    Array<{
      teamName: string;
      editing: boolean;
    }>
  >([]);

  const car = query.getAll('car');
  const showCar1 = car.includes('Car 1');
  const showCar2 = car.includes('Car 2');

  const teamCategory = query.getAll('teamCategory');
  const showElectricalTeamCategory = teamCategory.includes('Electrical');
  const showMechanicalTeamCategory = teamCategory.includes('Mechanical');
  const showSoftwareTeamCategory = teamCategory.includes('Software');
  const showBusinessTeamCategory = teamCategory.includes('Business');

  const team = query.getAll('team');
  const showErgonomicsTeam = team.includes('Ergonomics');
  const showLowVoltageTeam = team.includes('Low Voltage');
  const showTractiveTeam = team.includes('Tractive');
  const showDataAndControlsTeam = team.includes('Data and Controls');
  const showSoftwareTeam = team.includes('Software');

  const showOnlyOverdue = query.get('overdue') ? query.get('overdue') === 'true' : false;

  const expanded = query.get('expanded') ? query.get('expanded') === 'true' : false;

  const defaultGanttFilters: GanttFilters = {
    showCar1,
    showCar2,
    showElectricalTeamCategory,
    showMechanicalTeamCategory,
    showSoftwareTeamCategory,
    showBusinessTeamCategory,
    showErgonomicsTeam,
    showLowVoltageTeam,
    showTractiveTeam,
    showDataAndControlsTeam,
    showSoftwareTeam,
    showOnlyOverdue,
    expanded
  };

  useEffect(() => {
    if (!projects) return;

    setTeamList(Array.from(new Set(projects.map(getProjectTeamsName))));

    const ganttFilters: GanttFilters = {
      showCar1,
      showCar2,
      showElectricalTeamCategory,
      showMechanicalTeamCategory,
      showSoftwareTeamCategory,
      showBusinessTeamCategory,
      showErgonomicsTeam,
      showLowVoltageTeam,
      showTractiveTeam,
      showDataAndControlsTeam,
      showSoftwareTeam,
      showOnlyOverdue,
      expanded
    };

    const filteredProjects = filterGanttProjects(projects, ganttFilters);
    const sortedProjects = filteredProjects.sort(
      (a, b) => (a.startDate || new Date()).getTime() - (b.startDate || new Date()).getTime()
    );
    const tasks: GanttTask[] = sortedProjects.flatMap((project) => transformProjectToGanttTask(project, expanded));

    setGanttTasks(tasks);
  }, [
    expanded,
    projects,
    showBusinessTeamCategory,
    showCar1,
    showCar2,
    showDataAndControlsTeam,
    showElectricalTeamCategory,
    showErgonomicsTeam,
    showLowVoltageTeam,
    showMechanicalTeamCategory,
    showOnlyOverdue,
    showSoftwareTeam,
    showSoftwareTeamCategory,
    showTractiveTeam
  ]);

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

  const carHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[] = [
    { filterLabel: 'Car 1', handler: car1Handler },
    { filterLabel: 'Car 2', handler: car2Handler }
  ];

  const electricalTeamCategoryHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showElectricalTeamCategory: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const mechanicalTeamCategoryHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showMechanicalTeamCategory: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const softwareTeamCategoryHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showSoftwareTeamCategory: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const businessTeamCategoryHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showBusinessTeamCategory: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const teamCategoriesHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[] = [
    { filterLabel: 'Electrical', handler: electricalTeamCategoryHandler },
    { filterLabel: 'Mechanical', handler: mechanicalTeamCategoryHandler },
    { filterLabel: 'Software', handler: softwareTeamCategoryHandler },
    { filterLabel: 'Business', handler: businessTeamCategoryHandler }
  ];

  const ergonomicsTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showErgonomicsTeam: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };
  const lowVoltageTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showLowVoltageTeam: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };
  const tractiveTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showTractiveTeam: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };
  const dataAndControlsTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showDataAndControlsTeam: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };
  const softwareTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showSoftwareTeam: event.target.checked };
    history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const teamsHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[] = [
    { filterLabel: 'Ergonomics', handler: ergonomicsTeamHandler },
    { filterLabel: 'Low Voltage', handler: lowVoltageTeamHandler },
    { filterLabel: 'Tractive', handler: tractiveTeamHandler },
    { filterLabel: 'Data and Controls', handler: dataAndControlsTeamHandler },
    { filterLabel: 'Software', handler: softwareTeamHandler }
  ];

  const overdueHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const ganttFilters: GanttFilters = { ...defaultGanttFilters, showOnlyOverdue: event.target.checked };
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

  // find the earliest start date and subtract 2 weeks to use as the first date on calendar
  const startDate =
    ganttTasks.length !== 0
      ? sub(
          ganttTasks
            .map((task) => task.start)
            .reduce((previous, current) => {
              return previous < current ? previous : current;
            }, new Date(8.64e15)),
          { weeks: 2 }
        )
      : sub(Date.now(), { weeks: 15 });

  // find the latest end date and add 6 months to use as the last date on calendar
  const endDate =
    ganttTasks.length !== 0
      ? add(
          ganttTasks
            .map((task) => task.end)
            .reduce((previous, current) => {
              return previous > current ? previous : current;
            }, new Date(-8.64e15)),
          { months: 6 }
        )
      : add(Date.now(), { weeks: 15 });

  const sortedTeamList: string[] = teamList.sort(sortTeamNames);

  // do something here with the data
  const saveChanges = (eventChanges: EventChange[]) => {
    if (eventChanges.length === 0) {
      console.log('no changes do nothing');
    } else {
      console.log('Changes:', eventChanges);
    }
  };

  const headerRight = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
      <GanttChartColorLegend />
      <GanttChartFiltersButton
        carHandlers={carHandlers}
        teamCategoriesHandlers={teamCategoriesHandlers}
        teamsHandlers={teamsHandlers}
        overdueHandler={overdueHandler}
        expandedHandler={expandedHandler}
        resetHandler={resetHandler}
      />
    </Box>
  );

  return (
    <PageLayout title="Gantt Chart" chips={<SearchBar placeholder="Search Project by Name" />} headerRight={headerRight}>
      <Box
        sx={{
          width: '100%',
          height: { xs: 'calc(100vh - 9.5rem )', md: 'calc(100vh - 6.25rem)' },
          overflow: 'scroll',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE and Edge
        }}
      >
        <GanttChartTimeline start={startDate} end={endDate} />
        <GanttChart
          startDate={startDate}
          endDate={endDate}
          teamsList={sortedTeamList}
          teamNameToGanttTasksMap={teamNameToGanttTasksMap}
          chartEditingState={chartEditingState}
          setChartEditingState={setChartEditingState}
          saveChanges={saveChanges}
          ganttTasks={ganttTasks}
          setGanttTasks={setGanttTasks}
        />
      </Box>
    </PageLayout>
  );
};

export default GanttChartPage;
