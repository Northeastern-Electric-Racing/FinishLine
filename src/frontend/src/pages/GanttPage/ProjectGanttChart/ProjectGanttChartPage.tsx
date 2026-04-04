/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { ChangeEvent, FC, useEffect, useState, useCallback, useMemo } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllProjectsGantt } from '../../../hooks/projects.hooks';
import ErrorPage from '../../ErrorPage';
import { add, sub } from 'date-fns';
import { useHistory } from 'react-router-dom';
import {
  applyChangesToWBSElement,
  constructCollectionsFromTeamPreviewAndProjects,
  constructFinalizedChanges,
  GanttChange,
  GanttCollection,
  GanttFilters,
  GanttTask,
  isProjectPreview,
  RequestEventChange,
  transformProjectToGanttTask,
  useGanttFilters
} from '../../../utils/gantt.utils';
import { routes } from '../../../utils/routes';
import { Box } from '@mui/material';
import PageLayout from '../../../components/PageLayout';
import { SearchBar } from '../../../components/SearchBar';
import GanttChartColorLegend from './GanttChartColorLegend';
import GanttChartFiltersButton from './GanttChartFiltersButton';
import GanttChart from '../GanttChart/GanttChart';
import {
  Car,
  ProjectGantt,
  Task,
  TaskPriority,
  TaskStatus,
  TeamPreview,
  TeamType,
  WbsElementPreview,
  WbsElementStatus,
  wbsPipe,
  WorkPackage,
  WorkPackageStage
} from 'shared';
import { useAllTeams } from '../../../hooks/teams.hooks';
import { useGetAllCars } from '../../../hooks/cars.hooks';
import { useAllTeamTypes } from '../../../hooks/team-types.hooks';
import AddGanttProjectModal from './AddGanttProjectModal';
import AddGanttWorkPackageModal from './AddGanttWorkPackageModal';
import AddGanttSelectionModal from './AddGanttSelectionModal';
import AddGanttTaskModal from './AddGanttTaskModal';
import { GanttRequestChangeModal } from './ProjectGanttChangeModals/GanttRequestChangeModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { v4 as uuidv4 } from 'uuid';
import { projectWbsPipe } from '../../../utils/pipes';
import { projectGanttTransformer } from '../../../apis/transformers/projects.transformers';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { all } from 'axios';

const getElementId = (element: WbsElementPreview | Task) => {
  return (element as WbsElementPreview).id ?? (element as Task).taskId;
};

const ProjectGanttChartPage: FC = () => {
  const {
    isLoading: projectsIsLoading,
    isError: projectsIsError,
    data: projects,
    error: projectsError
  } = useAllProjectsGantt();

  /******************** Filters ***************************/
  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: teamTypes,
    error: teamTypesError
  } = useAllTeamTypes();

  const { isLoading: carsIsLoading, isError: carsIsError, data: cars, error: carsError } = useGetAllCars();
  const { isLoading: teamsIsLoading, isError: teamsIsError, data: teams, error: teamsError } = useAllTeams();

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

  return <ProjectGanttChartPageData projects={projects} teams={teams} teamTypes={teamTypes} cars={cars} />;
};

interface ProjectGanttChartPageDataProps {
  projects: ProjectGantt[];
  teams: TeamPreview[];
  teamTypes: TeamType[];
  cars: Car[];
}

const ProjectGanttChartPageData: FC<ProjectGanttChartPageDataProps> = ({ projects, teams, teamTypes, cars }) => {
  const history = useHistory();
  const toast = useToast();

  const { filters, setFilters } = useGanttFilters('project-gantt');
  const [searchText, setSearchText] = useState<string>('');
  const [addedProjects, setAddedProjects] = useState<ProjectGantt[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectGantt[]>([]);
  const [editedProjects, setEditedProjects] = useState<ProjectGantt[]>([]);
  const [collections, setCollections] = useState<GanttCollection<TeamPreview, WbsElementPreview | Task>[]>([]);

  useEffect(() => {
    const requestRefresh = (
      projects: ProjectGantt[],
      teams: TeamPreview[],
      editedProjects: ProjectGantt[],
      addedProjects: ProjectGantt[],
      filters: GanttFilters,
      searchText: string
    ) => {
      let allProjects: ProjectGantt[] = JSON.parse(JSON.stringify(projects.concat(addedProjects))).map(
        projectGanttTransformer
      );
      allProjects = allProjects.map((project) => {
        const editedProject = editedProjects.find((proj) => proj.id === project.id);
        return editedProject ? editedProject : project;
      }); // I dont like how inefficient this is
      setAllProjects(allProjects);
      setCollections(
        constructCollectionsFromTeamPreviewAndProjects(
          teams,
          allProjects,
          filters,
          searchText,
          transformProjectToGanttTask,
          projectGanttTransformer
        )
      );
    };

    if (projects && teams) {
      requestRefresh(projects, teams, editedProjects, addedProjects, filters, searchText);
    }
  }, [teams, projects, addedProjects, setAllProjects, setCollections, editedProjects, filters, searchText, history]);

  const [showWorkPackagesMap, setShowWorkPackagesMap] = useState<Map<string, boolean>>(new Map());

  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddWorkPackageModal, setShowAddWorkPackageModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [ganttChanges, setGanttChanges] = useState<GanttChange<WbsElementPreview | Task>[]>([]);
  const [requestEventChanges, setRequestEventChanges] = useState<RequestEventChange<WbsElementPreview | Task>[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectGantt | undefined>(undefined);
  const [selectedTeam, setSelectedTeam] = useState<TeamPreview | undefined>(undefined);

  const user = useCurrentUser();

  const handleSetGanttFilters = (newFilters: GanttFilters) => {
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

  const overdueHandler = [
    {
      filterLabel: 'Overdue',
      handler: (event: ChangeEvent<HTMLInputElement>) =>
        handleSetGanttFilters({ ...filters, showOnlyOverdue: event.target.checked }),
      defaultChecked: filters.showOnlyOverdue
    }
  ];

  const hideTasksHandler = [
    {
      filterLabel: 'Hide Tasks',
      handler: (event: ChangeEvent<HTMLInputElement>) =>
        handleSetGanttFilters({ ...filters, hideTasks: event.target.checked }),
      defaultChecked: filters.hideTasks
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
      defaultChecked: filters.showCars.includes(carNum)
    };
  });

  const resetHandler = () => {
    history.push(routes.GANTT);
    localStorage.removeItem('ganttURL');
    showWorkPackagesMap.clear();
  };

  /* **************************************************** */
  /* ****************** Editability ********************* */

  const handleCancel = useCallback((_collection?: GanttCollection<TeamPreview, WbsElementPreview | Task>) => {
    //TODO Filter by gantt collection
    setAddedProjects([]);
    setEditedProjects([]);
    setSelectedTeam(undefined);
    setSelectedProject(undefined);
  }, []);

  const onAddNewSubtask = useCallback((parent: GanttTask<WbsElementPreview | Task>) => {
    if (isProjectPreview(parent.element)) {
      setSelectedProject(parent.element);
      setShowSelectionModal(true);
    }
  }, []);

  const onAddNewTask = useCallback((collection: GanttCollection<TeamPreview, WbsElementPreview | Task>) => {
    setSelectedTeam(collection.element);
    setShowAddProjectModal(true);
  }, []);

  const handleAddWorkPackageInfo = (
    workPackageInfo: { name: string; stage?: WorkPackageStage },
    parentProject: ProjectGantt
  ) => {
    const newWorkPackageNumber = parentProject.workPackages.length + 1;
    const id = uuidv4();
    const workPackage: WorkPackage = {
      id,
      projectId: parentProject.id,
      name: workPackageInfo.name,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      blockedBy: [],
      wbsNum: {
        carNumber: parentProject.wbsNum.carNumber,
        projectNumber: parentProject.wbsNum.projectNumber,
        workPackageNumber: newWorkPackageNumber
      },
      stage: workPackageInfo.stage,
      projectName: parentProject.name,
      status: WbsElementStatus.Inactive,
      orderInProject: newWorkPackageNumber,
      duration: 1,
      blocking: [],
      descriptionBullets: [],
      links: [],
      wbsElementId: '-1',
      dateCreated: new Date(),
      teamTypes: [],
      changes: [],
      designReviews: [],
      deleted: false
    };

    addNewWorkPackageHandler(workPackage);

    createChange({
      id,
      type: 'create-sub-task',
      element: workPackage
    });
    setSelectedProject(undefined);
  };

  const getNewProjectNumber = (carNumber: number) => {
    const existingCarProjects = allProjects.filter((project) => project.wbsNum.carNumber === carNumber).length;

    return existingCarProjects + 1;
  };

  const handleWorkPackageSelected = () => {
    setShowAddWorkPackageModal(true);
  };

  const handleTaskSelected = () => {
    setShowAddTaskModal(true);
  };

  const handleAddTaskInfo = (
    taskInfo: {
      title: string;
      priority: TaskPriority;
      status: TaskStatus;
      assignees: string[];
      notes: string;
      startDate: Date | null;
      deadline: Date | null;
    },
    parentProject: ProjectGantt
  ) => {
    const taskId = uuidv4();

    // Calculate deadline: use provided deadline or default to 1 week from now
    const deadline = taskInfo.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const startDate = taskInfo.startDate || new Date();

    const newTask: Task = {
      taskId,
      wbsNum: parentProject.wbsNum,
      title: taskInfo.title,
      notes: taskInfo.notes,
      dateCreated: new Date(),
      createdBy: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      assignees: [],
      deadline,
      startDate,
      priority: taskInfo.priority,
      status: taskInfo.status
    };

    addNewTaskHandler(newTask, parentProject.id);

    createChange({
      id: taskId,
      type: 'create-sub-task',
      element: newTask
    });
    setSelectedProject(undefined);
  };
  const handleAddProjectInfo = async (
    projectInfo: { name: string; carNumber: number },
    selectedTeam: { teamId: string; teamName: string }
  ) => {
    const mockProject: ProjectGantt = {
      id: uuidv4(),
      name: projectInfo.name,
      wbsNum: {
        carNumber: projectInfo.carNumber,
        projectNumber: getNewProjectNumber(projectInfo.carNumber),
        workPackageNumber: 0
      },
      status: WbsElementStatus.Inactive,
      workPackages: [],
      deleted: false,
      tasks: [],
      budget: 0,
      teams: [selectedTeam],
      duration: 1,
      wbsElementId: '-1',
      dateCreated: new Date()
    };

    // Add to local state and create change request event
    addNewProjectHandler(mockProject);

    // Create a RequestEventChange for the modal system
    const requestChange: RequestEventChange<ProjectGantt> = {
      changeId: uuidv4(),
      element: mockProject,
      newStart: new Date(),
      newEnd: new Date(),
      type: 'create-task' // Projects use 'create-task' type in the modal system
    };

    setRequestEventChanges((prev) => [...prev, requestChange]);
    setSelectedTeam(undefined);
  };

  const createChange = (change: GanttChange<WbsElementPreview | Task>) => {
    setGanttChanges([...ganttChanges, change]);
  };

  const createChangeHandler = useCallback(
    (change: GanttChange<WbsElementPreview | Task>) => {
      const parentProject = allProjects.find((project) => wbsPipe(project.wbsNum) === projectWbsPipe(change.element.wbsNum)); // Find the project that either the change is on, or the changes work package is a part of
      if (!parentProject) return;

      const { updatedProject } = applyChangesToWBSElement([change], change.element, parentProject);
      const addedProject = addedProjects.find((proj) => proj.id === updatedProject.id);
      if (addedProject) {
        setAddedProjects((prev) => [...prev.filter((project) => project.id !== updatedProject.id), updatedProject]);
      } else {
        setEditedProjects((prev) => [...prev.filter((project) => project.id !== updatedProject.id), updatedProject]);
      }

      createChange(change);
    },
    [allProjects, addedProjects]
  );

  const saveChanges = async () => {
    try {
      if (ganttChanges.length > 0) {
        const requestEventChanges = constructFinalizedChanges(projects, addedProjects.concat(editedProjects), ganttChanges);
        setRequestEventChanges(requestEventChanges);
        if (requestEventChanges.length > 0) {
          const { element } = requestEventChanges[requestEventChanges.length - 1];
          setShowWorkPackagesMap((prev) => new Map(prev.set(element.id, true)));
        }
      } else {
        toast.success('Changes saved successfully!');
        handleCancel();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const AddProjectModal = () => {
    return (
      <AddGanttProjectModal
        showModal={showAddProjectModal}
        handleClose={() => setShowAddProjectModal(false)}
        addProject={(projectInfo) => {
          if (selectedTeam) {
            handleAddProjectInfo(projectInfo, selectedTeam);
          } else {
            toast.error('No Team Selected');
          }
        }}
      />
    );
  };

  const AddWorkPackageModal = () => {
    return (
      <AddGanttWorkPackageModal
        showModal={showAddWorkPackageModal}
        handleClose={() => setShowAddWorkPackageModal(false)}
        addWorkPackage={(wpInfo) => {
          if (selectedProject) {
            handleAddWorkPackageInfo(wpInfo, selectedProject);
          } else {
            toast.error('No Parent Project Selected');
          }
        }}
      />
    );
  };

  const AddTaskModal = () => {
    return (
      <AddGanttTaskModal
        showModal={showAddTaskModal}
        handleClose={() => setShowAddTaskModal(false)}
        addTask={(taskInfo) => {
          if (selectedProject) {
            handleAddTaskInfo(taskInfo, selectedProject);
          } else {
            toast.error('No Parent Project Selected');
          }
        }}
      />
    );
  };

  const SelectionModal = () => {
    return (
      <AddGanttSelectionModal
        showModal={showSelectionModal}
        handleClose={() => setShowSelectionModal(false)}
        onWorkPackageSelected={handleWorkPackageSelected}
        onTaskSelected={handleTaskSelected}
        projectName={selectedProject?.name || 'Project'}
      />
    );
  };

  const reverseEventChange = (change: RequestEventChange<WbsElementPreview | Task>) => {
    const { element } = change;
    switch (change.type) {
      case 'create-task':
        setAddedProjects((prev) => prev.filter((project) => project.id !== getElementId(element)));
        break;
      case 'edit-task':
        setEditedProjects((prev) => prev.filter((project) => project.id !== getElementId(element)));
    }
  };

  const removeActiveModal = (change: RequestEventChange<WbsElementPreview | Task>, cancelled: boolean) => {
    const newChanges = requestEventChanges.filter((newChange) => newChange.changeId !== change.changeId);
    setRequestEventChanges(newChanges);
    if (newChanges.length === 0) {
      handleCancel();
    } else {
      const change = newChanges[newChanges.length - 1];
      setShowWorkPackagesMap(
        (prev) => new Map(prev.set((change.element as Task).taskId ?? (change.element as WbsElementPreview).id, true))
      );
    }

    if (cancelled) {
      reverseEventChange(change);
    }
  };

  const addNewProjectHandler = (project: ProjectGantt) => {
    setAddedProjects((prev) => [...prev, project]);
  };

  const addNewWorkPackageHandler = (workPackage: WorkPackage) => {
    const editedParentProject = editedProjects.find((project) => project.id === workPackage.projectId); // check for an already edited project
    if (editedParentProject) {
      editedParentProject.workPackages.push(workPackage);
      setEditedProjects((prev) => [...prev.filter((project) => project.id !== editedParentProject.id), editedParentProject]);
    } else {
      const newParentProject = addedProjects.find((project) => project.id === workPackage.projectId); // Check for a newly created project
      if (newParentProject) {
        newParentProject.workPackages.push(workPackage);
        setAddedProjects((prev) => [...prev.filter((project) => project.id !== newParentProject.id), newParentProject]);
      } else {
        const originalProject = projects.find((project) => project.id === workPackage.projectId); // Check for an unedited original project

        if (originalProject) {
          const copy = projectGanttTransformer(JSON.parse(JSON.stringify(originalProject))); // Need to maintain integrity of original projects
          copy.workPackages.push(workPackage);
          setEditedProjects((prev) => [...prev, copy]);
        }
      }
    }
  };

  const addNewTaskHandler = (task: Task, projectId: string) => {
    const editedParentProject = editedProjects.find((project) => project.id === projectId); // check for an already edited project
    if (editedParentProject) {
      editedParentProject.tasks.push(task);
      setEditedProjects((prev) => [...prev.filter((project) => project.id !== editedParentProject.id), editedParentProject]);
    } else {
      const newParentProject = addedProjects.find((project) => project.id === projectId); // Check for a newly created project
      if (newParentProject) {
        newParentProject.tasks.push(task);
        setAddedProjects((prev) => [...prev.filter((project) => project.id !== newParentProject.id), newParentProject]);
      } else {
        const originalProject = projects.find((project) => project.id === projectId); // Check for an unedited original project

        if (originalProject) {
          const copy = projectGanttTransformer(JSON.parse(JSON.stringify(originalProject))); // Need to maintain integrity of original projects
          copy.tasks.push(task);
          setEditedProjects((prev) => [...prev, copy]);
        }
      }
    }
  };

  const highlightProjectComparator = useCallback(
    (highlightedElement: WbsElementPreview | Task, wbsElement: WbsElementPreview | Task) => {
      return projectWbsPipe(highlightedElement.wbsNum) === projectWbsPipe(wbsElement.wbsNum);
    },
    []
  );

  const highlightWorkPackageComparator = useCallback(
    (highlightedElement: WbsElementPreview | Task, wbsElement: WbsElementPreview | Task) => {
      return wbsPipe(highlightedElement.wbsNum) === wbsPipe(wbsElement.wbsNum);
    },
    []
  );

  /* **************************************************** */

  const allWorkPackages = projects.concat(addedProjects).flatMap((project) => project.workPackages);

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
    allProjects.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, false)));
    });
  };

  const expandHandler = () => {
    allProjects.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
    });
  };

  const toggleElementShowChildren = useCallback((element: WbsElementPreview | Task) => {
    setShowWorkPackagesMap((prev) => new Map(prev.set(getElementId(element), !prev.get(getElementId(element)))));
  }, []);

  const headerRight = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
      <GanttChartColorLegend />
      <GanttChartFiltersButton
        carHandlers={carHandlers}
        teamTypeHandlers={teamTypeHandlers}
        teamHandlers={teamHandlers}
        overdueHandler={overdueHandler}
        hideTasksHandler={hideTasksHandler}
        resetHandler={resetHandler}
        collapseHandler={collapseHandler}
        expandHandler={expandHandler}
      />
    </Box>
  );

  return (
    <>
      <AddProjectModal />
      <AddWorkPackageModal />
      <AddTaskModal />
      <SelectionModal />
      {requestEventChanges.map((change) => (
        <GanttRequestChangeModal change={change} open handleClose={(didCancel) => removeActiveModal(change, didCancel)} />
      ))}
      <PageLayout
        title="Gantt Chart"
        chips={<SearchBar placeholder="Search Project by Name" searchText={searchText} setSearchText={setSearchText} />}
        headerRight={headerRight}
      >
        <GanttChart
          collections={collections}
          startDate={startDate}
          endDate={endDate}
          editability={{
            onEditPressed: (collection) => setSelectedTeam(collection.element),
            onCancelChanges: handleCancel,
            onCreateChange: createChangeHandler,
            highlightedChange: requestEventChanges[requestEventChanges.length - 1],
            onNewTaskPressed: onAddNewTask,
            onNewSubTaskPressed: onAddNewSubtask,
            createTaskTitle: 'Create New Project',
            onSavePressed: saveChanges,
            highlightSubtaskComparator: highlightWorkPackageComparator,
            highlightTaskComparator: highlightProjectComparator
          }}
          shouldShowChildren={(task) => !!showWorkPackagesMap.get(getElementId(task.element))}
          onShowChildrenToggle={(task) => toggleElementShowChildren(task.element)}
        />
      </PageLayout>
    </>
  );
};

export default ProjectGanttChartPage;
