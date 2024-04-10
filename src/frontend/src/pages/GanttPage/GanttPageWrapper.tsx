/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import React, { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllProjects } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import { WbsElementStatus, WorkPackageStage } from 'shared';
import GanttChart from './GanttChart';
import GanttPageFilter from './GanttPageFilter';
import { Info, Edit } from '@mui/icons-material/';
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
  getProjectTeamsName
} from '../../utils/gantt.utils';
import { routes } from '../../utils/routes';
import {
  Box,
  Popover,
  Typography,
  IconButton,
  useTheme,
  Chip,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  styled
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { GanttChartCalendar } from './GanttPackage/components/calendar/GanttChartCalendar';
import { NERButton } from '../../components/NERButton';
import { EventChange } from './GanttPackage/components/other/event';
import {
  GanttWorkPackageStageColorPipe,
  GanttWorkPackageTextColorPipe,
  WbsElementStatusTextPipe,
  WorkPackageStageTextPipe
} from '../../utils/enum-pipes';

/**
 * Documentation for the Gantt package: https://github.com/MaTeMaTuK/gantt-task-react
 */
const GanttPageWrapper: FC = () => {
  const query = useQuery();
  const history = useHistory();
  const theme = useTheme();
  const { isLoading, isError, data: projects, error } = useAllProjects();
  const [teamList, setTeamList] = useState<string[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [anchorFilterEl, setAnchorFilterEl] = useState<HTMLButtonElement | null>(null);
  const [chartEditingState, setChartEditingState] = React.useState<
    Array<{
      teamName: string;
      editing: boolean;
    }>
  >([]);
  const showCar1 = query.get('showCar1') === 'false' || query.get('showCar1') === null;
  const showCar2 = query.get('showCar2') === 'false' || query.get('showCar2') === null;
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
    expanded
  };

  useEffect(() => {
    if (!projects) return;

    setTeamList(Array.from(new Set(projects.map(getProjectTeamsName))));

    const ganttFilters: GanttFilters = {
      showCar1,
      showCar2,
      expanded
    };

    const filteredProjects = filterGanttProjects(projects, ganttFilters);
    const sortedProjects = filteredProjects.sort(
      (a, b) => (a.startDate || new Date()).getTime() - (b.startDate || new Date()).getTime()
    );
    const tasks: GanttTask[] = sortedProjects.flatMap((project) => transformProjectToGanttTask(project, expanded));

    setGanttTasks(tasks);
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

  const carHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[] = [
    { filterLabel: 'Car 1', handler: car1Handler },
    { filterLabel: 'Car 2', handler: car2Handler }
  ];

  const electricalTeamCategoryHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const mechanicalTeamCategoryHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const softwareTeamCategoryHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const businessTeamCategoryHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const teamCategoriesHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[] = [
    { filterLabel: 'Electrical', handler: electricalTeamCategoryHandler },
    { filterLabel: 'Mechanical', handler: mechanicalTeamCategoryHandler },
    { filterLabel: 'Software', handler: softwareTeamCategoryHandler },
    { filterLabel: 'Business', handler: businessTeamCategoryHandler }
  ];

  const ergonomicsTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };
  const lowVoltageTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };
  const tractiveTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };
  const dataAndControlsTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };
  const softwareTeamHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
  };

  const teamsHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[] = [
    { filterLabel: 'Ergonomics', handler: ergonomicsTeamHandler },
    { filterLabel: 'Low Voltage', handler: lowVoltageTeamHandler },
    { filterLabel: 'Tractive', handler: tractiveTeamHandler },
    { filterLabel: 'Data and Controls', handler: dataAndControlsTeamHandler },
    { filterLabel: 'Software', handler: softwareTeamHandler }
  ];

  const overdueHandler = (event: ChangeEvent<HTMLInputElement>) => {
    //TODO:
    //const ganttFilters: GanttFilters = { ...defaultGanttFilters, showCar1: event.target.checked };
    //history.push(`${history.location.pathname + buildGanttSearchParams(ganttFilters)}`);
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
  const ganttStartDate =
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

  // find the latest end date and add 3 weeks to use as the last date on calendar
  const ganttEndDate =
    ganttTasks.length !== 0
      ? add(
          ganttTasks
            .map((task) => task.end)
            .reduce((previous, current) => {
              return previous > current ? previous : current;
            }, new Date(-8.64e15)),
          { weeks: 3 }
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

  const ganttCharts: JSX.Element[] = sortedTeamList.map((teamName: string) => {
    const tasks = teamNameToGanttTasksMap.get(teamName);

    if (!chartEditingState.map((entry) => entry.teamName).includes(teamName)) {
      setChartEditingState([...chartEditingState, { teamName, editing: false }]);
    }

    const isEditMode = chartEditingState.find((entry) => entry.teamName === teamName)?.editing || false;

    const handleEdit = () => {
      const index = chartEditingState.findIndex((entry) => entry.teamName === teamName);
      if (index !== -1) {
        chartEditingState[index] = { teamName, editing: !isEditMode };
      }

      setChartEditingState([...chartEditingState]);
    };

    if (!tasks) return <></>;

    return (
      <Box
        sx={{
          mt: 2,
          py: 1,
          background: isEditMode ? theme.palette.divider : 'transparent',
          width: 'fit-content',
          pl: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 1,
            position: 'sticky',
            left: 0,
            width: 'fit-content',
            height: '30px'
          }}
        >
          <Typography variant="h5">{teamName}</Typography>

          {isEditMode ? (
            <Chip label="Save" onClick={handleEdit} />
          ) : (
            <IconButton onClick={handleEdit}>
              <Edit />
            </IconButton>
          )}
        </Box>
        <Box key={teamName} sx={{ my: 3, width: 'fit-content' }}>
          <GanttChart
            ganttTasks={tasks}
            start={ganttStartDate}
            end={ganttEndDate}
            isEditMode={isEditMode}
            onExpanderClick={(newTask) => {
              const newTasks = ganttTasks.map((task) => (newTask.id === task.id ? { ...newTask, teamName } : task));
              setGanttTasks(newTasks);
            }}
            saveChanges={saveChanges}
          />
        </Box>
      </Box>
    );
  });

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorFilterEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorFilterEl(null);
  };

  const open = Boolean(anchorFilterEl);

  const colorLegend = (
    <Box sx={{ display: 'flex', width: 'fit-content', gap: 2, p: 2 }}>
      {
        // map through all the WP Stages
        Object.values(WorkPackageStage).map((stage) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', width: 'fit-content', gap: 1 }}>
            <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
              {WorkPackageStageTextPipe(stage)}
            </Typography>
            {
              // map through all the Wbs Element Statuses
              Object.values(WbsElementStatus).map((status) => (
                <Box
                  sx={{
                    backgroundColor: GanttWorkPackageStageColorPipe(stage, status),
                    height: '2rem',
                    width: '8rem',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body1" sx={{ color: GanttWorkPackageTextColorPipe(stage) }}>
                    {WbsElementStatusTextPipe(status)}
                  </Typography>
                </Box>
              ))
            }
          </Box>
        ))
      }
    </Box>
  );

  const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 'none'
    }
  });

  const headerRight = (
    <>
      <NoMaxWidthTooltip title={colorLegend} placement="left-start" sx={{ maxWidth: 'none' }}>
        <Info
          sx={{
            color: theme.palette.text.primary,
            marginX: '1rem',
            '&:hover': {
              color: theme.palette.text.secondary
            }
          }}
        />
      </NoMaxWidthTooltip>

      <NERButton variant="contained" onClick={handleFilterClick}>
        Filters
      </NERButton>
      <Popover
        open={open}
        anchorEl={anchorFilterEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{ dispaly: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <GanttPageFilter
          car1Handler={car1Handler}
          car2Handler={car2Handler}
          carHandlers={carHandlers}
          teamCategoriesHandlers={teamCategoriesHandlers}
          teamsHandlers={teamsHandlers}
          overdueHandler={overdueHandler}
          status={status}
          expandedHandler={expandedHandler}
          teamList={teamList}
          selectedTeam={selectedTeam}
          currentStart={start}
          currentEnd={end}
          resetHandler={resetHandler}
        />
      </Popover>
    </>
  );

  return (
    <PageLayout title="Gantt Chart" headerRight={headerRight}>
      <Box sx={{ width: '100%', height: '100%', overflowX: 'scroll' }}>
        <GanttChartCalendar start={ganttStartDate} end={ganttEndDate} />
        {ganttCharts}
      </Box>
    </PageLayout>
  );
};

export default GanttPageWrapper;
