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
  buildGanttSearchParams,
  GanttFilters,
  RequestEventChange,
  aggregateGanttChanges,
  sortTeamList,
  GanttChange,
  transformProjectPreviewToProject
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
import { Project, ProjectPreview, Team, TeamType, WbsElement, WorkPackage } from 'shared';
import { useAllTeams } from '../../hooks/teams.hooks';
import { GanttRequestChangeModal } from './GanttChartComponents/GanttChangeModals/GanttRequestChangeModal';
import { useGetAllCars } from '../../hooks/cars.hooks';

const GanttChartPage: FC = () => {
  const query = useQuery();
  const history = useHistory();
  const ganttParams = localStorage.getItem('ganttURL');
  if (ganttParams && history.location.search !== ganttParams) {
    history.push(`${history.location.pathname + ganttParams}`);
  }
  const { isLoading: projectsIsLoading, isError: projectsIsError, data: projects, error: projectsError } = useAllProjects();
  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: teamTypes,
    error: teamTypesError
  } = useAllTeamTypes();
  const { isLoading: carsIsLoading, isError: carsIsError, data: cars, error: carsError } = useGetAllCars();

  const { isLoading: teamsIsLoading, isError: teamsIsError, data: teams, error: teamsError } = useAllTeams();
  const [searchText, setSearchText] = useState<string>('');
  const [ganttTaskChanges, setGanttTaskChanges] = useState<RequestEventChange[]>([]);
  const [showWorkPackagesMap, setShowWorkPackagesMap] = useState<Map<string, boolean>>(new Map());
  const [addedProjects, setAddedProjects] = useState<Project[]>([]);
  const [addedWorkPackages, setAddedWorkPackages] = useState<WorkPackage[]>([]);
  const [clearEdits, setClearEdits] = useState<boolean>(false);

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

  if (
    projectsIsLoading ||
    teamTypesIsLoading ||
    teamsIsLoading ||
    !teams ||
    !projects ||
    !teamTypes ||
    carsIsLoading ||
    !cars
  )
    return <LoadingIndicator />;
  if (projectsIsError) return <ErrorPage message={projectsError.message} />;
  if (teamTypesIsError) return <ErrorPage message={teamTypesError.message} />;
  if (teamsIsError) return <ErrorPage message={teamsError.message} />;
  if (carsIsError) return <ErrorPage message={carsError.message} />;

  const carFilterHandler = (car: number) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const ganttFilters: GanttFilters = event.target.checked
        ? { ...defaultGanttFilters, showCars: Array.from(new Set([...defaultGanttFilters.showCars, car])) }
        : { ...defaultGanttFilters, showCars: defaultGanttFilters.showCars.filter((c) => c !== car) };
      history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
    };
  };

  const teamTypeFilterHandler = (teamType: TeamType) => {
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

  const teamFilterHandler = (team: Team) => {
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
  }[] = cars.map((car) => {
    const carNum = car.wbsNum.carNumber;
    return {
      filterLabel: carNum === 0 ? 'None' : `Car ${carNum}`,
      handler: carFilterHandler(carNum),
      defaultChecked: defaultGanttFilters.showCars.includes(carNum)
    };
  });

  const teamTypeHandlers: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked: boolean;
  }[] = teamTypes.map((teamType) => {
    return {
      filterLabel: teamType.name,
      handler: teamTypeFilterHandler(teamType),
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
      handler: teamFilterHandler(team),
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
    localStorage.removeItem('ganttURL');
    showWorkPackagesMap.clear();
  };

  /***************************************************** */

  const addProjectHandler = (project: ProjectPreview, team: Team) => {
    const newProject: Project = transformProjectPreviewToProject(project, team);

    setAddedProjects((prev) => [...prev, newProject]);
  };

  const addWorkPackageHandler = (workPackage: WorkPackage) => {
    setAddedWorkPackages((prev) => [...prev, workPackage]);
  };

  const allWorkPackages = projects.flatMap((project) => project.workPackages).concat(addedWorkPackages);
  const allProjects = projects.concat(addedProjects);
  const allWbsElements: WbsElement[] = [...allProjects];
  allWbsElements.push(...allWorkPackages);

  // find the earliest start date and subtract 2 weeks to use as the first date on calendar
  const startDate =
    allWorkPackages.length !== 0
      ? sub(
          allWorkPackages
            .map((wp) => wp.startDate)
            .reduce((previous, current) => {
              return previous < current ? previous : current;
            }, new Date(8.64e15)),
          { weeks: 2 }
        )
      : sub(Date.now(), { weeks: 15 });

  // find the latest end date and add 6 months to use as the last date on calendar
  const endDate =
    allWorkPackages.length !== 0
      ? add(
          allWorkPackages
            .map((wp) => wp.endDate)
            .reduce((previous, current) => {
              return previous > current ? previous : current;
            }, new Date(-8.64e15)),
          { months: 6 }
        )
      : add(Date.now(), { weeks: 15 });

  const teamList = teams.sort((a, b) => a.teamName.localeCompare(b.teamName));

  const getNewWorkPackageNumber = (projectId: string) => {
    const project = allProjects.find((project) => project.id === projectId);
    if (!project) {
      return 1;
    }

    return project.workPackages.length + 1;
  };

  const saveChanges = (eventChanges: GanttChange[]) => {
    const updatedGanttChanges = aggregateGanttChanges(eventChanges, allWbsElements);

    setGanttTaskChanges(updatedGanttChanges);
  };

  const removeActiveModal = (changeId: string) => {
    const newChanges = ganttTaskChanges.filter((change) => change.changeId !== changeId);
    setGanttTaskChanges(newChanges);
    if (newChanges.length === 0) {
      console.log('clearing edits from page');
      setAddedProjects([]);
      setAddedWorkPackages([]);
      setClearEdits(true);
    }
  };

  const collapseHandler = () => {
    allProjects.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, false)));
    });
  };

  const expandHandler = () => {
    allProjects.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
    });
  };

  const getNewProjectNumber = (carNumber: number) => {
    const existingCarProjects = allProjects.filter((project) => project.wbsNum.carNumber === carNumber).length;

    return existingCarProjects + 1;
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
          teamsList={teamList.sort((a, b) => sortTeamList(a, b, defaultGanttFilters, searchText))}
          saveChanges={saveChanges}
          showWorkPackagesMap={showWorkPackagesMap}
          setShowWorkPackagesMap={setShowWorkPackagesMap}
          highlightedChange={ganttTaskChanges[ganttTaskChanges.length - 1]}
          addProject={addProjectHandler}
          addWorkPackage={addWorkPackageHandler}
          getNewProjectNumber={getNewProjectNumber}
          getNewWorkPackageNumber={getNewWorkPackageNumber}
          defaultGanttFilters={defaultGanttFilters}
          searchText={searchText}
          clearEdits={clearEdits}
          setClearEdits={setClearEdits}
        />
        {ganttTaskChanges.map((change) => (
          <GanttRequestChangeModal change={change} open handleClose={() => removeActiveModal(change.changeId)} />
        ))}
      </Box>
    </PageLayout>
  );
};

export default GanttChartPage;
