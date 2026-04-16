/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const getElementId = (element: WbsElementPreview | Task) => {
  return (element as WbsElementPreview).id ?? (element as Task).taskId;
};

const highlightProjectComparator = (highlightedElement: WbsElementPreview | Task, wbsElement: WbsElementPreview | Task) =>
  projectWbsPipe(highlightedElement.wbsNum) === projectWbsPipe(wbsElement.wbsNum);

const highlightWorkPackageComparator = (
  highlightedElement: WbsElementPreview | Task,
  wbsElement: WbsElementPreview | Task
) => wbsPipe(highlightedElement.wbsNum) === wbsPipe(wbsElement.wbsNum);

const MemoizedGanttChart = React.memo(GanttChart) as typeof GanttChart;

const ProjectGanttChartPage: FC = () => {
  const history = useHistory();
  const toast = useToast();

  const {
    isLoading: projectsIsLoading,
    isError: projectsIsError,
    data: projects,
    error: projectsError
  } = useAllProjectsGantt();

  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: teamTypes,
    error: teamTypesError
  } = useAllTeamTypes();

  const { isLoading: carsIsLoading, isError: carsIsError, data: cars, error: carsError } = useGetAllCars();
  const { isLoading: teamsIsLoading, isError: teamsIsError, data: teams, error: teamsError } = useAllTeams();
  const [searchText, setSearchText] = useState<string>('');
  const [addedProjects, setAddedProjects] = useState<ProjectGantt[]>([]);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddWorkPackageModal, setShowAddWorkPackageModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [ganttChanges, setGanttChanges] = useState<GanttChange<WbsElementPreview | Task>[]>([]);
  const [requestEventChanges, setRequestEventChanges] = useState<RequestEventChange<WbsElementPreview | Task>[]>([]);
  const selectedTeamRef = useRef<TeamPreview | undefined>(undefined);
  const selectedProjectRef = useRef<ProjectGantt | undefined>(undefined);
  const [collections, setCollections] = useState<GanttCollection<TeamPreview, WbsElementPreview | Task>[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectGantt[]>([]);
  const [editedProjects, setEditedProjects] = useState<ProjectGantt[]>([]);
  const user = useCurrentUser();

  /******************** Filters ***************************/
  const { filters, setFilters } = useGanttFilters('project-gantt');

  const addedProjectsRef = useRef(addedProjects);
  addedProjectsRef.current = addedProjects;
  const editedProjectsRef = useRef(editedProjects);
  editedProjectsRef.current = editedProjects;
  const ganttChangesRef = useRef(ganttChanges);
  ganttChangesRef.current = ganttChanges;
  const allProjectsRef = useRef(allProjects);
  allProjectsRef.current = allProjects;
  const projectsRef = useRef(projects);
  projectsRef.current = projects;
  const toastRef = useRef(toast);
  toastRef.current = toast;

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

  const handleSetGanttFilters = (newFilters: GanttFilters) => {
    setFilters(newFilters);
  };

  const handleCancel = useCallback((_collection?: GanttCollection<TeamPreview, WbsElementPreview | Task>) => {
    //TODO Filter by gantt collection
    if (addedProjectsRef.current.length > 0) setAddedProjects([]);
    if (editedProjectsRef.current.length > 0) setEditedProjects([]);
    setGanttChanges([]);
    selectedTeamRef.current = undefined;
    selectedProjectRef.current = undefined;
  }, []);

  const onAddNewSubtask = useCallback((parent: GanttTask<WbsElementPreview | Task>) => {
    if (isProjectPreview(parent.element)) {
      selectedProjectRef.current = parent.element;
      setShowSelectionModal(true);
    }
  }, []);

  const onAddNewTask = useCallback((collection: GanttCollection<TeamPreview, WbsElementPreview | Task>) => {
    selectedTeamRef.current = collection.element;
    setShowAddProjectModal(true);
  }, []);

  const onEditPressed = useCallback((_collection: GanttCollection<TeamPreview, WbsElementPreview | Task>) => {
    selectedTeamRef.current = _collection.element;
  }, []);

  const createChangeHandler = useCallback((change: GanttChange<WbsElementPreview | Task>) => {
    setGanttChanges((prev) => [...prev, change]);
  }, []);

  const saveChanges = useCallback(async () => {
    try {
      const currentGanttChanges = ganttChangesRef.current;
      const currentAddedProjects = addedProjectsRef.current;
      const currentProjects = projectsRef.current;

      if (currentGanttChanges.length > 0 || currentAddedProjects.length > 0) {
        const dragChanges = currentGanttChanges.filter((c) => c.type !== 'create-sub-task');

        const projectChangesMap = new Map<string, GanttChange<WbsElementPreview | Task>[]>();
        for (const change of dragChanges) {
          const key = projectWbsPipe(change.element.wbsNum);
          if (!projectChangesMap.has(key)) projectChangesMap.set(key, []);
          projectChangesMap.get(key)!.push(change);
        }

        const updatedProjects = [...allProjectsRef.current];
        for (const [projKey, changes] of projectChangesMap) {
          const projectIndex = updatedProjects.findIndex((p) => projectWbsPipe(p.wbsNum) === projKey);
          if (projectIndex === -1) continue;
          let currentProject = updatedProjects[projectIndex];

          const elementChangesMap = new Map<string, GanttChange<WbsElementPreview | Task>[]>();
          for (const change of changes) {
            const key = wbsPipe(change.element.wbsNum);
            if (!elementChangesMap.has(key)) elementChangesMap.set(key, []);
            elementChangesMap.get(key)!.push(change);
          }

          for (const [, elementChanges] of elementChangesMap) {
            const { updatedProject } = applyChangesToWBSElement(elementChanges, elementChanges[0].element, currentProject);
            currentProject = updatedProject;
          }
          updatedProjects[projectIndex] = currentProject;
        }

        const eventChanges = constructFinalizedChanges(currentProjects ?? [], updatedProjects, currentGanttChanges);
        setRequestEventChanges(eventChanges);
      } else {
        toastRef.current.success('Changes saved successfully!');
        handleCancel();
      }
    } catch (error) {
      if (error instanceof Error) {
        toastRef.current.error(error.message);
      }
    }
  }, [handleCancel]);

  const allWorkPackages = useMemo(
    () => (projects ?? []).concat(addedProjects).flatMap((project) => project.workPackages),
    [projects, addedProjects]
  );

  const startDate = useMemo(
    () =>
      allWorkPackages.length !== 0
        ? sub(
            allWorkPackages
              .map((wp) => wp.startDate)
              .reduce((previous, current) => (previous < current ? previous : current), new Date(8.64e15)),
            { weeks: 2 }
          )
        : sub(Date.now(), { weeks: 15 }),
    [allWorkPackages]
  );

  const endDate = useMemo(
    () =>
      allWorkPackages.length !== 0
        ? add(
            allWorkPackages
              .map((wp) => wp.endDate)
              .reduce((previous, current) => (previous > current ? previous : current), new Date(-8.64e15)),
            { months: 6 }
          )
        : add(Date.now(), { weeks: 15 }),
    [allWorkPackages]
  );

  const editability = useMemo(
    () => ({
      onEditPressed,
      onCancelChanges: handleCancel,
      onCreateChange: createChangeHandler,
      highlightedChange: requestEventChanges[requestEventChanges.length - 1],
      onNewTaskPressed: onAddNewTask,
      onNewSubTaskPressed: onAddNewSubtask,
      createTaskTitle: 'Create New Project',
      onSavePressed: saveChanges,
      highlightSubtaskComparator: highlightWorkPackageComparator,
      highlightTaskComparator: highlightProjectComparator
    }),
    [requestEventChanges, onEditPressed, handleCancel, createChangeHandler, onAddNewTask, onAddNewSubtask, saveChanges]
  );

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
    history.push(routes.GANTT);
    localStorage.removeItem('ganttURL');
  };

  const headerRight = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
      <GanttChartColorLegend />
      <GanttChartFiltersButton
        carHandlers={carHandlers}
        teamTypeHandlers={teamTypeHandlers}
        teamHandlers={teamHandlers}
        resetHandler={resetHandler}
      />
    </Box>
  );

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

  const createChange = (change: GanttChange<WbsElementPreview | Task>) => {
    setGanttChanges((prev) => [...prev, change]);
  };

  const getNewProjectNumber = (carNumber: number) => {
    const existingCarProjects = allProjects.filter((project) => project.wbsNum.carNumber === carNumber).length;

    return existingCarProjects + 1;
  };

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
      events: [],
      deleted: false
    };

    addNewWorkPackageHandler(workPackage);

    createChange({
      id,
      type: 'create-sub-task',
      element: workPackage
    });
    selectedProjectRef.current = undefined;
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
    selectedProjectRef.current = undefined;
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
    selectedTeamRef.current = undefined;
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
    if (newChanges.length === 0) handleCancel();
    if (cancelled) reverseEventChange(change);
  };

  const AddProjectModal = () => {
    return (
      <AddGanttProjectModal
        showModal={showAddProjectModal}
        handleClose={() => setShowAddProjectModal(false)}
        addProject={(projectInfo) => {
          if (selectedTeamRef.current) {
            handleAddProjectInfo(projectInfo, selectedTeamRef.current);
          } else {
            toast.error('No Team Selected');
          }
        }}
        cars={cars}
      />
    );
  };

  const AddWorkPackageModal = () => {
    return (
      <AddGanttWorkPackageModal
        showModal={showAddWorkPackageModal}
        handleClose={() => setShowAddWorkPackageModal(false)}
        addWorkPackage={(wpInfo) => {
          if (selectedProjectRef.current) {
            handleAddWorkPackageInfo(wpInfo, selectedProjectRef.current);
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
          if (selectedProjectRef.current) {
            handleAddTaskInfo(taskInfo, selectedProjectRef.current);
          } else {
            toast.error('No Parent Project Selected');
          }
        }}
      />
    );
  };

  const handleWorkPackageSelected = () => {
    setShowAddWorkPackageModal(true);
  };

  const handleTaskSelected = () => {
    setShowAddTaskModal(true);
  };

  const SelectionModal = () => {
    return (
      <AddGanttSelectionModal
        showModal={showSelectionModal}
        handleClose={() => setShowSelectionModal(false)}
        onWorkPackageSelected={handleWorkPackageSelected}
        onTaskSelected={handleTaskSelected}
        projectName={selectedProjectRef.current?.name || 'Project'}
      />
    );
  };

  console.log('whole page rerender!');

  return (
    <>
      <AddProjectModal />
      <AddWorkPackageModal />
      <AddTaskModal />
      <SelectionModal />
      {requestEventChanges.map((change) => (
        <GanttRequestChangeModal
          key={change.changeId}
          change={change}
          open
          handleClose={(didCancel) => removeActiveModal(change, didCancel)}
        />
      ))}
      <PageLayout
        title="Gantt Chart"
        chips={<SearchBar placeholder="Search Project by Name" searchText={searchText} setSearchText={setSearchText} />}
        headerRight={headerRight}
      >
        <MemoizedGanttChart collections={collections} startDate={startDate} endDate={endDate} editability={editability} />
      </PageLayout>
    </>
  );
};

export default ProjectGanttChartPage;
