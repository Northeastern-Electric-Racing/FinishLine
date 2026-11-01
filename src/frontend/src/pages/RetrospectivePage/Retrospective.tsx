import { useGetRetrospectiveTimelines } from '../../hooks/retrospective.hooks';
import { useAllTeams } from '../../hooks/teams.hooks';
import { useHistory } from 'react-router-dom';
import { useGetAllCars } from '../../hooks/cars.hooks';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import { ChangeEvent, useEffect, useState } from 'react';
import { RetrospectiveProjectPreview, Task, TeamPreview, TeamType, WbsElementPreview } from 'shared';
import {
  constructCollectionsFromTeamPreviewAndProjects,
  GanttCollection,
  getGanttDateBounds,
  RetroGanttFilters,
  transformRetrospectiveProjectToGanttTask,
  useGanttFilters
} from '../../utils/gantt.utils';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { routes } from '../../utils/routes';
import PageLayout from '../../components/PageLayout';
import { SearchBar } from '../../components/SearchBar';
import GanttChart from '../GanttPage/GanttChart/GanttChart';
import GanttChartColorLegend from '../GanttPage/ProjectGanttChart/GanttChartColorLegend';
import GanttChartFiltersButton from '../GanttPage/ProjectGanttChart/GanttChartFiltersButton';
import { Box } from '@mui/system';
import { retrospectiveProjectPreviewTransformer } from '../../apis/transformers/projects.transformers';
import { DatePicker } from '@mui/x-date-pickers';

const RetrospectivePage = () => {
  const history = useHistory();
  const { filters, setFilters } = useGanttFilters('retro-gantt');

  const { data: teams, isLoading: teamsIsLoading, isError: teamsIsError, error: teamsError } = useAllTeams();

  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: teamTypes,
    error: teamTypesError
  } = useAllTeamTypes();

  const { isLoading: carsIsLoading, isError: carsIsError, data: cars, error: carsError } = useGetAllCars();

  const [searchText, setSearchText] = useState<string>('');
  const [collections, setCollections] = useState<GanttCollection<TeamPreview, WbsElementPreview | Task>[]>([]);

  const {
    data: projects,
    isLoading: projectsIsLoading,
    isError: projectsIsError,
    error: projectsError
  } = useGetRetrospectiveTimelines(filters.startDate, filters.endDate);

  useEffect(() => {
    const requestRefresh = (
      projects: RetrospectiveProjectPreview[],
      teams: TeamPreview[],
      filters: RetroGanttFilters,
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
    };

    if (projects && teams) {
      requestRefresh(projects, teams, filters, searchText);
    }
  }, [teams, projects, setCollections, filters, searchText]);

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

  /******************** Filters ***************************/
  const handleSetGanttFilters = (newFilters: RetroGanttFilters) => {
    setFilters(newFilters);
  };

  const carFilterHandler = (car: number) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      handleSetGanttFilters(
        event.target.checked
          ? { ...filters, showCars: Array.from(new Set([...filters.showCars, car])) }
          : { ...filters, showCars: filters.showCars.filter((c) => c !== car) }
      );
    };
  };

  const teamTypeFilterHandler = (teamType: TeamType) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      handleSetGanttFilters(
        event.target.checked
          ? {
              ...filters,
              showTeamTypes: Array.from(new Set([...filters.showTeamTypes, teamType.name]))
            }
          : { ...filters, showTeamTypes: filters.showTeamTypes.filter((t) => t !== teamType.name) }
      );
    };
  };

  const teamFilterHandler = (team: TeamPreview) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      handleSetGanttFilters(
        event.target.checked
          ? { ...filters, showTeams: Array.from(new Set([...filters.showTeams, team.teamName])) }
          : { ...filters, showTeams: filters.showTeams.filter((t) => t !== team.teamName) }
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
      defaultChecked: filters.showTeamTypes.includes(teamType.name)
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
      defaultChecked: filters.showTeams.includes(team.teamName)
    };
  });

  const carHandlers: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked: boolean;
  }[] = cars.map((car) => {
    const carNum = car.wbsNum.carNumber;
    return {
      filterLabel: carNum === 0 ? 'None' : `Car ${carNum}`,
      handler: carFilterHandler(carNum),
      defaultChecked: filters.showCars.includes(carNum)
    };
  });

  const resetHandler = () => {
    history.push(routes.RETROSPECTIVE);
    localStorage.removeItem('retro-gantt');
  };

  /***************************************************** */

  const allWorkPackages = projects.flatMap((project) => project.workPackages);

  const { start: startDate, end: endDate } = getGanttDateBounds(allWorkPackages);

  const headerRight = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
      <GanttChartColorLegend />
      <DatePicker
        value={filters.startDate}
        label={'Start Date For Retro'}
        onChange={(e) => handleSetGanttFilters({ ...filters, startDate: e ?? undefined })}
        sx={{ width: 400 }}
      />
      <GanttChartFiltersButton
        carHandlers={carHandlers}
        teamTypeHandlers={teamTypeHandlers}
        teamHandlers={teamHandlers}
        resetHandler={resetHandler}
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
        <GanttChart collections={collections} startDate={startDate} endDate={endDate} />
      </PageLayout>
    </>
  );
};

export default RetrospectivePage;
