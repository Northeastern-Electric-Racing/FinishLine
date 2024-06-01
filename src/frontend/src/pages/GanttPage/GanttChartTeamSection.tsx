import { Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import GanttChartSection from './GanttChartSection';
import {
  aggregateGanttChanges,
  applyChangesToWBSElement,
  GanttChange,
  RequestEventChange,
  transformProjectPreviewToProject
} from '../../utils/gantt.utils';
import { Dispatch, useState } from 'react';
import useId from '@mui/material/utils/useId';
import { Project, ProjectPreview, Team, WbsElement, WbsElementStatus, wbsPipe, WorkPackage } from 'shared';
import { projectWbsPipe } from '../../utils/pipes';
import { GanttRequestChangeModal } from './GanttChartComponents/GanttChangeModals/GanttRequestChangeModal';
import AddGanttProjectModal from './GanttChartComponents/AddGanttProjectModal';

interface GanttChartTeamSectionProps {
  startDate: Date;
  endDate: Date;
  team: Team;
  projects: ProjectPreview[];
  addNewWorkPackage: (workPackage: WorkPackage) => void;
  addNewProject: (project: Project) => void;
  getNewProjectNumber: (carNumber: number) => number;
  allWbsElements: WbsElement[];
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: Dispatch<React.SetStateAction<Map<string, boolean>>>;
  removeAddedProjects: (projects: Project[]) => void;
  removeAddedWorkPackages: (workPackages: WorkPackage[]) => void;
}

const GanttChartTeamSection = ({
  startDate,
  endDate,
  team,
  projects,
  addNewWorkPackage,
  addNewProject,
  getNewProjectNumber,
  allWbsElements,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  removeAddedProjects,
  removeAddedWorkPackages
}: GanttChartTeamSectionProps) => {
  const theme = useTheme();
  const [ganttChanges, setGanttChanges] = useState<GanttChange[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const id = useId() || 'id';
  const [projectsState, setProjectsState] = useState<ProjectPreview[]>([...projects]);
  const [requestEventChanges, setRequestEventChanges] = useState<RequestEventChange[]>([]);
  const [addedProjects, setAddedProjects] = useState<Project[]>([]);
  const [addedWorkPackages, setAddedWorkPackages] = useState<WorkPackage[]>([]);

  const teamSectionBackgroundStyle = {
    mt: 1,
    py: 1,
    background: isEditMode ? theme.palette.divider : 'transparent',
    borderRadius: '0.25rem',
    width: 'fit-content'
  };

  const teamDescriptionContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: '-15px',
    pl: 2,
    position: 'sticky',
    left: 0,
    width: 'fit-content',
    height: '30px'
  };

  const createChange = (change: GanttChange) => {
    setGanttChanges([...ganttChanges, change]);
  };

  const handleSave = () => {
    saveChanges(ganttChanges);
    setGanttChanges([]);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setGanttChanges([]);
    setProjectsState([...projects]);
  };

  const handleEdit = () => {
    projectsState.forEach((project) => {
      setShowWorkPackagesMap((prev) => new Map(prev.set(project.id, true)));
    });

    setIsEditMode(true);
  };

  // Sorting the work packages of each project based on their start date
  projectsState.forEach((project) => {
    project.workPackages.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  });

  const addNewWorkPackageHandler = (workPackage: WorkPackage) => {
    const project = projectsState.find((project) => wbsPipe(project.wbsNum) === projectWbsPipe(workPackage.wbsNum));
    if (!project) return;
    workPackage.wbsNum.workPackageNumber = project.workPackages.length + 1;
    project.workPackages = [...project.workPackages, workPackage];
    setProjectsState([...projectsState]);
    setAddedWorkPackages([...addedWorkPackages, workPackage]);
    addNewWorkPackage(workPackage);
  };

  const addNewProjectHandler = (project: ProjectPreview) => {
    setProjectsState([...projectsState, project]);
    const newProject: Project = transformProjectPreviewToProject(project, team);
    setAddedProjects([...addedProjects, newProject]);
    addNewProject(newProject);
  };

  const createChangeHandler = (change: GanttChange) => {
    const parentProject = projectsState.find((project) => wbsPipe(project.wbsNum) === projectWbsPipe(change.element.wbsNum)); // Find the project that either the change is on, or the changes work package is a part of
    if (!parentProject) return;

    const newProject: Project = applyChangesToWBSElement(
      [change],
      transformProjectPreviewToProject(parentProject, team),
      parentProject
    ) as Project;

    const index = projectsState.findIndex((project) => wbsPipe(project.wbsNum) === projectWbsPipe(newProject.wbsNum));
    projectsState[index] = newProject; // Reset the project in the projects state, potentially unnecessary
    setProjectsState([...projectsState]);
    createChange(change);
  };

  const getNewWorkPackageNumber = (projectId: string) => {
    const project = allWbsElements.find((wbsElement) => wbsElement.id === projectId) as Project;
    if (!project) {
      return 1;
    }

    return project.workPackages.length + 1;
  };

  const saveChanges = (eventChanges: GanttChange[]) => {
    const requestEventChanges = aggregateGanttChanges(eventChanges, allWbsElements);

    setRequestEventChanges(requestEventChanges);
  };

  const removeActiveModal = (changeId: string) => {
    const newChanges = requestEventChanges.filter((change) => change.changeId !== changeId);
    setRequestEventChanges(newChanges);
    if (newChanges.length === 0) {
      removeAddedProjects([...addedProjects]);
      removeAddedWorkPackages([...addedWorkPackages]);
      setAddedProjects([]);
      setAddedWorkPackages([]);
      setProjectsState([...projects]);
    }
  };

  const AddProjectModal = () => {
    return (
      <AddGanttProjectModal
        showModal={showAddProjectModal}
        handleClose={() => setShowAddProjectModal(false)}
        addProject={(project) => {
          const newProject: ProjectPreview = {
            id: id + projects.length + 1,
            name: project.name,
            wbsNum: {
              carNumber: project.carNumber,
              projectNumber: getNewProjectNumber(project.carNumber),
              workPackageNumber: 0
            },
            status: WbsElementStatus.Inactive,
            workPackages: []
          };

          addNewProjectHandler(newProject);

          handleEdit();

          createChange({
            id,
            type: 'create-project',
            element: transformProjectPreviewToProject(newProject, team)
          });
        }}
      />
    );
  };

  return (
    <Box sx={teamSectionBackgroundStyle}>
      <AddProjectModal />
      <Box sx={teamDescriptionContainerStyle}>
        <Typography variant="h6" fontWeight={400}>
          {team.teamName}
        </Typography>

        {isEditMode ? (
          <Box display={'flex'} alignItems="center">
            <Chip label="Save" onClick={handleSave} sx={{ marginRight: '10px' }} />
            <Chip label="Cancel" onClick={handleCancel} sx={{ marginRight: '10px' }} />
            <Chip label="Create Project" onClick={() => setShowAddProjectModal(true)} />
          </Box>
        ) : (
          <IconButton onClick={handleEdit}>
            <Edit />
          </IconButton>
        )}
      </Box>
      <Box key={team.teamId} sx={{ my: 0, width: 'fit-content', pl: 2 }}>
        <GanttChartSection
          start={startDate}
          end={endDate}
          isEditMode={isEditMode}
          projects={projectsState}
          createChange={createChangeHandler}
          showWorkPackagesMap={showWorkPackagesMap}
          setShowWorkPackagesMap={setShowWorkPackagesMap}
          highlightedChange={requestEventChanges[requestEventChanges.length - 1]}
          addWorkPackage={addNewWorkPackageHandler}
          teamName={team.teamName}
          getNewWorkPackageNumber={getNewWorkPackageNumber}
        />
      </Box>
      {requestEventChanges.map((change) => (
        <GanttRequestChangeModal change={change} open handleClose={() => removeActiveModal(change.changeId)} />
      ))}
    </Box>
  );
};

export default GanttChartTeamSection;
