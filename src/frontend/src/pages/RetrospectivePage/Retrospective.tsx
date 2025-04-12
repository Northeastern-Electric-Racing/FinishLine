import { useGetRetrospectiveTimelines } from '../../hooks/retrospective.hooks';
import { useAllTeams } from '../../hooks/teams.hooks';
import { useHistory } from 'react-router-dom';
import { useGetAllCars } from '../../hooks/cars.hooks';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import { ChangeEvent, useEffect, useState } from 'react';
import { RetrospectiveProjectPreview, TeamPreview, TeamType, WbsElementPreview } from 'shared';
import {
  buildGanttSearchParams,
  constructCollectionsFromTeamPreviewAndProjects,
  GanttCollection,
  GanttFilters,
  transformRetrospectiveProjectToGanttTask
} from '../../utils/gantt.utils';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useQuery } from '../../hooks/utils.hooks';
import { routes } from '../../utils/routes';
import PageLayout from '../../components/PageLayout';
import { SearchBar } from '../../components/SearchBar';
import GanttChart from '../GanttPage/GanttChart/GanttChart';
import GanttChartColorLegend from '../GanttPage/ProjectGanttChart/GanttChartColorLegend';
import GanttChartFiltersButton from '../GanttPage/ProjectGanttChart/GanttChartFiltersButton';
import { Box } from '@mui/system';
import { add, sub } from 'date-fns';
import { retrospectiveProjectPreviewTransformer } from '../../apis/transformers/projects.transformers';

const RetrospectivePage = () => {
  const query = useQuery();
  const history = useHistory();

  const ganttParams = localStorage.getItem('ganttURL');
  if (ganttParams && history.location.search !== ganttParams) {
    history.push(`${history.location.pathname + ganttParams}`);
  }

  const {
    data: projects,
    isLoading: projectsIsLoading,
    isError: projectsIsError,
    error: projectsError
  } = useGetRetrospectiveTimelines();
  const { data: teams, isLoading: teamsIsLoading, isError: teamsIsError, error: teamsError } = useAllTeams();

  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: teamTypes,
    error: teamTypesError
  } = useAllTeamTypes();

  const { isLoading: carsIsLoading, isError: carsIsError, data: cars, error: carsError } = useGetAllCars();

  const [searchText, setSearchText] = useState<string>('');
  const [showWorkPackagesMap, setShowWorkPackagesMap] = useState<Map<string, boolean>>(new Map());
  const [collections, setCollections] = useState<GanttCollection<TeamPreview, WbsElementPreview>[]>([]);

  /******************** Filters ***************************/
  const showCars = query.getAll('car').map((car) => parseInt(car));

  const showTeamTypes = query.getAll('teamType');

  const showTeams = query.getAll('team');

  const showOnlyOverdue = query.get('overdue') ? query.get('overdue') === 'true' : false;

  const [ganttFilters, setGanttFilters] = useState<GanttFilters>({
    showCars,
    showTeamTypes,
    showTeams,
    showOnlyOverdue
  });

  useEffect(() => {
    const requestRefresh = (
      projects: RetrospectiveProjectPreview[],
      teams: TeamPreview[],
      filters: GanttFilters,
      searchText: string
    ) => {
      setCollections(
        constructCollectionsFromTeamPreviewAndProjects(
          teams,
          projects,
          filters,
          searchText,
          transformRetrospectiveProjectToGanttTask,
          retrospectiveProjectPreviewTransformer
        )
      );
      history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
    };

    if (projects && teams) {
      requestRefresh(projects, teams, ganttFilters, searchText);
    }
  }, [teams, projects, setCollections, ganttFilters, searchText, history]);

  if (projectsIsError) return <ErrorPage message={projectsError.message} />;
  if (teamTypesIsError) return <ErrorPage message={teamTypesError.message} />;
  if (teamsIsError) return <ErrorPage message={teamsError.message} />;
  if (carsIsError) return <ErrorPage message={carsError.message} />;
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

  const carFilterHandler = (car: number) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setGanttFilters(
        event.target.checked
          ? { ...ganttFilters, showCars: Array.from(new Set([...ganttFilters.showCars, car])) }
          : { ...ganttFilters, showCars: ganttFilters.showCars.filter((c) => c !== car) }
      );
    };
  };

  const teamTypeFilterHandler = (teamType: TeamType) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setGanttFilters(
        event.target.checked
          ? {
              ...ganttFilters,
              showTeamTypes: Array.from(new Set([...ganttFilters.showTeamTypes, teamType.name]))
            }
          : { ...ganttFilters, showTeamTypes: ganttFilters.showTeamTypes.filter((t) => t !== teamType.name) }
      );
      history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
    };
  };

  const teamFilterHandler = (team: TeamPreview) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setGanttFilters(
        event.target.checked
          ? { ...ganttFilters, showTeams: Array.from(new Set([...ganttFilters.showTeams, team.teamName])) }
          : { ...ganttFilters, showTeams: ganttFilters.showTeams.filter((t) => t !== team.teamName) }
      );
    };
  };

  const teamTypeHandlers: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked: boolean;
  }[] = teamTypes.map((teamType) => {
    return {
      filterLabel: teamType.name,
      handler: teamTypeFilterHandler(teamType),
      defaultChecked: ganttFilters.showTeamTypes.includes(teamType.name)
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
      defaultChecked: ganttFilters.showTeams.includes(team.teamName)
    };
  });

  const overdueHandler = [
    {
      filterLabel: 'Overdue',
      handler: (event: ChangeEvent<HTMLInputElement>) =>
        setGanttFilters({ ...ganttFilters, showOnlyOverdue: event.target.checked }),
      defaultChecked: ganttFilters.showOnlyOverdue
    }
  ];

  const carHandlers: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked: boolean;
  }[] = cars.map((car) => {
    const carNum = car.wbsNum.carNumber;
    return {
      filterLabel: carNum === 0 ? 'None' : `Car ${carNum}`,
      handler: carFilterHandler(carNum),
      defaultChecked: ganttFilters.showCars.includes(carNum)
    };
  });

  const resetHandler = () => {
    history.push(routes.GANTT);
    localStorage.removeItem('ganttURL');
    showWorkPackagesMap.clear();
  };

  /***************************************************** */

  const allWorkPackages = projects.flatMap((project) => project.workPackages);

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

  const collapseHandler = () => {
    projects.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, false)));
    });
  };

  const expandHandler = () => {
    projects.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
    });
  };

  const toggleElementShowChildren = (element: WbsElementPreview) => {
    setShowWorkPackagesMap((prev) => new Map(prev.set(element.id, !prev.get(element.id))));
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
    <>
      <PageLayout
        title="Gantt Chart"
        chips={<SearchBar placeholder="Search Project by Name" searchText={searchText} setSearchText={setSearchText} />}
        headerRight={headerRight}
      >
        <GanttChart
          collections={collections}
          startDate={startDate}
          endDate={endDate}
          shouldShowChildren={(task) => !!showWorkPackagesMap.get(task.element.id)}
          onShowChildrenToggle={(task) => toggleElementShowChildren(task.element)}
        />
      </PageLayout>
    </>
  );
};

export default RetrospectivePage;
