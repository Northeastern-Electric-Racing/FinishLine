/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { ChangeEvent, FC, useEffect, useState } from 'react';
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
import { GanttRequestChangeModal } from './ProjectGanttChangeModals/GanttRequestChangeModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { v4 as uuidv4 } from 'uuid';
import { projectWbsPipe } from '../../../utils/pipes';
import { projectGanttTransformer } from '../../../apis/transformers/projects.transformers';

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
  const [showWorkPackagesMap, setShowWorkPackagesMap] = useState<Map<string, boolean>>(new Map());
  const [addedProjects, setAddedProjects] = useState<ProjectGantt[]>([]);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddWorkPackageModal, setShowAddWorkPackageModal] = useState(false);
  const [ganttChanges, setGanttChanges] = useState<GanttChange<WbsElementPreview>[]>([]);
  const [requestEventChanges, setRequestEventChanges] = useState<RequestEventChange<WbsElementPreview>[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectGantt | undefined>(undefined);
  const [selectedTeam, setSelectedTeam] = useState<TeamPreview | undefined>(undefined);
  const [collections, setCollections] = useState<GanttCollection<TeamPreview, WbsElementPreview>[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectGantt[]>([]);
  const [editedProjects, setEditedProjects] = useState<ProjectGantt[]>([]);

  /******************** Filters ***************************/
  const { filters, setFilters } = useGanttFilters('project-gantt');

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

  const overdueHandler = [
    {
      filterLabel: 'Overdue',
      handler: (event: ChangeEvent<HTMLInputElement>) =>
        handleSetGanttFilters({ ...filters, showOnlyOverdue: event.target.checked }),
      defaultChecked: filters.showOnlyOverdue
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

  const handleCancel = (_collection?: GanttCollection<TeamPreview, WbsElementPreview>) => {
    //TODO Filter by gantt collection
    setAddedProjects([]);
    setEditedProjects([]);
    setSelectedTeam(undefined);
    setSelectedProject(undefined);
  };

  const onAddNewSubtask = (parent: GanttTask<WbsElementPreview>) => {
    if (isProjectPreview(parent.element)) {
      setSelectedProject(parent.element);
      setShowAddWorkPackageModal(true);
    }
  };

  const onAddNewTask = (collection: GanttCollection<TeamPreview, WbsElementPreview>) => {
    setSelectedTeam(collection.element);
    setShowAddProjectModal(true);
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

  const handleAddProjectInfo = (
    projectInfo: { name: string; carNumber: number },
    selectedTeam: { teamId: string; teamName: string }
  ) => {
    const id = uuidv4();
    const newProject: ProjectGantt = {
      id,
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
      dateCreated: new Date(),
    };

    addNewProjectHandler(newProject);

    createChange({
      id,
      type: 'create-task',
      element: newProject
    });
  };

  const createChange = (change: GanttChange<WbsElementPreview>) => {
    setGanttChanges([...ganttChanges, change]);
  };

  const createChangeHandler = (change: GanttChange<WbsElementPreview>) => {
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
  };

  const saveChanges = () => {
    try {
      const requestEventChanges = constructFinalizedChanges(projects, addedProjects.concat(editedProjects), ganttChanges);

      setRequestEventChanges(requestEventChanges);
      if (requestEventChanges.length > 0) {
        const { element } = requestEventChanges[requestEventChanges.length - 1];
        setShowWorkPackagesMap((prev) => new Map(prev.set(element.id, true)));
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

  const reverseEventChange = (change: RequestEventChange<WbsElementPreview>) => {
    const { element } = change;
    switch (change.type) {
      case 'create-task':
        setAddedProjects((prev) => prev.filter((project) => project.id !== element.id));
        break;
      case 'edit-task':
        setEditedProjects((prev) => prev.filter((project) => project.id !== element.id));
    }
  };

  const removeActiveModal = (change: RequestEventChange<WbsElementPreview>, cancelled: boolean) => {
    const newChanges = requestEventChanges.filter((newChange) => newChange.changeId !== change.changeId);
    setRequestEventChanges(newChanges);
    if (newChanges.length === 0) {
      handleCancel();
    } else {
      const change = newChanges[newChanges.length - 1];
      setShowWorkPackagesMap((prev) => new Map(prev.set(change.element.id, true)));
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

  const highlightProjectComparator = (highlightedElement: WbsElementPreview, wbsElement: WbsElementPreview) => {
    return projectWbsPipe(highlightedElement.wbsNum) === projectWbsPipe(wbsElement.wbsNum);
  };

  const highlightWorkPackageComparator = (highlightedElement: WbsElementPreview, wbsElement: WbsElementPreview) => {
    return wbsPipe(highlightedElement.wbsNum) === wbsPipe(wbsElement.wbsNum);
  };

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
      <AddProjectModal />
      <AddWorkPackageModal />
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
          shouldShowChildren={(task) => !!showWorkPackagesMap.get(task.element.id)}
          onShowChildrenToggle={(task) => toggleElementShowChildren(task.element)}
        />
      </PageLayout>
    </>
  );
};

export default ProjectGanttChartPage;
