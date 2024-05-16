/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { ChangeEvent, FC, useState } from 'react';
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
  EventChange,
  RequestEventChange,
  aggregateGanttChanges
} from '../../utils/gantt.utils';
import { routes } from '../../utils/routes';
import { Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { GanttChartTimeline } from './GanttChartComponents/GanttChartTimeline';
import { SearchBar } from '../../components/SearchBar';
import GanttChartColorLegend from './GanttChartComponents/GanttChartColorLegend';
import GanttChartFiltersButton from './GanttChartComponents/GanttChartFiltersButton';
import GanttChart from './GanttChart';
import { useAllTeamTypes } from '../../hooks/design-reviews.hooks';
import { Team, TeamType } from 'shared';
import { useAllTeams } from '../../hooks/teams.hooks';
import { GanttRequestChangeModal } from './GanttChartComponents/GanttRequestChangeModal';

const GanttChartPage: FC = () => {
  const query = useQuery();
  const history = useHistory();
  const { isLoading: projectsIsLoading, isError: projectsIsError, data: projects, error: projectsError } = useAllProjects();
  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: teamTypes,
    error: teamTypesError
  } = useAllTeamTypes();
  const { isLoading: teamsIsLoading, isError: teamsIsError, data: teams, error: teamsError } = useAllTeams();
  const [searchText, setSearchText] = useState<string>('');
  const [ganttTaskChanges, setGanttTaskChanges] = useState<RequestEventChange[]>([]);
  const [showWorkPackagesMap, setShowWorkPackagesMap] = useState<Map<string, boolean>>(new Map());

  /******************** Filters ***************************/
  const showCars = query.getAll('car').map((car) => parseInt(car));

  const showTeamTypes = query.getAll('teamType');

  const showTeams = query.getAll('team');

  const showOnlyOverdue = query.get('overdue') ? query.get('overdue') === 'true' : false;

  const defaultGanttFilters: GanttFilters = {
    showCars,
    showTeamTypes,
    showTeams,
    showOnlyOverdue
  };

  const filteredProjects = filterGanttProjects(projects ?? [], defaultGanttFilters, searchText);
  const sortedProjects = filteredProjects.sort(
    (a, b) => (a.startDate || new Date()).getTime() - (b.startDate || new Date()).getTime()
  );
  const ganttProjectTasks = sortedProjects.flatMap((project) => transformProjectToGanttTask(project));

  if (projectsIsLoading || teamTypesIsLoading || teamsIsLoading || !teams || !projects || !teamTypes)
    return <LoadingIndicator />;
  if (projectsIsError) return <ErrorPage message={projectsError.message} />;
  if (teamTypesIsError) return <ErrorPage message={teamTypesError.message} />;
  if (teamsIsError) return <ErrorPage message={teamsError.message} />;

  const carHandlerFn = (car: number) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const ganttFilters: GanttFilters = event.target.checked
        ? { ...defaultGanttFilters, showCars: Array.from(new Set([...defaultGanttFilters.showCars, car])) }
        : { ...defaultGanttFilters, showCars: defaultGanttFilters.showCars.filter((c) => c !== car) };
      history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
    };
  };

  const teamTypeHandlerFn = (teamType: TeamType) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const ganttFilters: GanttFilters = event.target.checked
        ? {
            ...defaultGanttFilters,
            showTeamTypes: Array.from(new Set([...defaultGanttFilters.showTeamTypes, teamType.name]))
          }
        : { ...defaultGanttFilters, showTeamTypes: defaultGanttFilters.showTeamTypes.filter((t) => t !== teamType.name) };
      history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
    };
  };

  const teamHandlerFn = (team: Team) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const ganttFilters: GanttFilters = event.target.checked
        ? { ...defaultGanttFilters, showTeams: Array.from(new Set([...defaultGanttFilters.showTeams, team.teamName])) }
        : { ...defaultGanttFilters, showTeams: defaultGanttFilters.showTeams.filter((t) => t !== team.teamName) };
      history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
    };
  };

  const carHandlers: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked: boolean;
  }[] = [
    { filterLabel: 'None', handler: carHandlerFn(0), defaultChecked: defaultGanttFilters.showCars.includes(0) },
    { filterLabel: 'Car 1', handler: carHandlerFn(1), defaultChecked: defaultGanttFilters.showCars.includes(1) },
    { filterLabel: 'Car 2', handler: carHandlerFn(2), defaultChecked: defaultGanttFilters.showCars.includes(2) }
  ];

  const teamTypeHandlers: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked: boolean;
  }[] = teamTypes.map((teamType) => {
    return {
      filterLabel: teamType.name,
      handler: teamTypeHandlerFn(teamType),
      defaultChecked: defaultGanttFilters.showTeamTypes.includes(teamType.name)
    };
  });

  const teamHandlers: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked: boolean;
  }[] = teams.map((team) => {
    return {
      filterLabel: team.teamName,
      handler: teamHandlerFn(team),
      defaultChecked: defaultGanttFilters.showTeams.includes(team.teamName)
    };
  });

  const overdueHandler = [
    {
      filterLabel: 'Overdue',
      handler: (event: ChangeEvent<HTMLInputElement>) => {
        const ganttFilters: GanttFilters = { ...defaultGanttFilters, showOnlyOverdue: event.target.checked };
        history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
      },
      defaultChecked: defaultGanttFilters.showOnlyOverdue
    }
  ];

  const resetHandler = () => {
    history.push(routes.GANTT);
    showWorkPackagesMap.clear();
  };

  /***************************************************** */

  const teamNameToGanttTasksMap = new Map<string, GanttTask[]>();

  ganttProjectTasks.forEach((ganttTask) => {
    const tasks: GanttTask[] = teamNameToGanttTasksMap.get(ganttTask.teamName) || [];
    tasks.push(ganttTask);
    teamNameToGanttTasksMap.set(ganttTask.teamName, tasks);
  });

  // find the earliest start date and subtract 2 weeks to use as the first date on calendar
  const startDate =
    ganttProjectTasks.length !== 0
      ? sub(
          ganttProjectTasks
            .map((task) => task.start)
            .reduce((previous, current) => {
              return previous < current ? previous : current;
            }, new Date(8.64e15)),
          { weeks: 2 }
        )
      : sub(Date.now(), { weeks: 15 });

  // find the latest end date and add 6 months to use as the last date on calendar
  const endDate =
    ganttProjectTasks.length !== 0
      ? add(
          ganttProjectTasks
            .map((task) => task.end)
            .reduce((previous, current) => {
              return previous > current ? previous : current;
            }, new Date(-8.64e15)),
          { months: 6 }
        )
      : add(Date.now(), { weeks: 15 });

  const teamList = Array.from(new Set(projects.map(getProjectTeamsName)));
  const sortedTeamList: string[] = teamList.sort(sortTeamNames);

  const saveChanges = (eventChanges: EventChange[]) => {
    //get wps out of each project
    const updatedGanttTasks = aggregateGanttChanges(
      eventChanges,
      ganttProjectTasks
        .flatMap((projectTask) =>
          projectTask.workPackages.map((wp) => {
            return { ...wp, teamName: projectTask.teamName };
          })
        )
        .concat(ganttProjectTasks)
    );
    setGanttTaskChanges(updatedGanttTasks);
  };

  const removeActiveModal = (changeId: string) => {
    setGanttTaskChanges(ganttTaskChanges.filter((change) => change.eventId !== changeId));
  };

  const collapseHandler = () => {
    ganttProjectTasks.forEach((task) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(task.id, false)));
    });
  };

  const expandHandler = () => {
    ganttProjectTasks.forEach((task) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(task.id, true)));
    });
  };

  const headerRight = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
      <GanttChartColorLegend />
      <GanttChartFiltersButton
        carHandlers={carHandlers}
        teamTypeHandlers={teamTypeHandlers}
        teamHandlers={teamHandlers}
        overdueHandler={overdueHandler}
        resetHandler={resetHandler}
        collapseHandler={collapseHandler}
        expandHandler={expandHandler}
      />
    </Box>
  );

  return (
    <PageLayout
      title="Gantt Chart"
      chips={<SearchBar placeholder="Search Project by Name" searchText={searchText} setSearchText={setSearchText} />}
      headerRight={headerRight}
    >
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
          saveChanges={saveChanges}
          showWorkPackagesMap={showWorkPackagesMap}
          setShowWorkPackagesMap={setShowWorkPackagesMap}
          highlightedChange={ganttTaskChanges[ganttTaskChanges.length - 1]}
        />
        {ganttTaskChanges.map((change) => (
          <GanttRequestChangeModal change={change} open handleClose={() => removeActiveModal(change.eventId)} />
        ))}
      </Box>
    </PageLayout>
  );
};

export default GanttChartPage;
